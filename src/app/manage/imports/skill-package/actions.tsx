'use server'

import _ from 'lodash'

import { auth } from '@clerk/nextjs/server'

import { getGroupsInPackage, getSkillsInPackage, PackageList, SkillPackageDef } from '@/data/skills'
import prisma from '@/lib/prisma'
import { ChangeCountsByType, createChangeCounts as createChangeCounts } from '@/lib/change-counts'
import { recordEvent } from '@/lib/history'
import { assertNonNull } from '@/lib/utils'


export interface ImportPackageActionResult {
    changeCounts: ChangeCountsByType<'packages' | 'skillGroups' | 'skills'>
    elapsedTime: number
}

export async function importPackageAction(packageIds: string[]): Promise<ImportPackageActionResult> {

    const { userId, orgId } = await auth.protect()
    assertNonNull(orgId, "An active organization is required to execute 'importPackageAction'")

    const startTime = Date.now()
    const changeCounts = createChangeCounts(['packages', 'skillGroups', 'skills'])

    const packagesToImport = PackageList.filter(pkg => packageIds.includes(pkg.id))

    // Packages that could need updating
    for(const skillPackage of packagesToImport) {
        const packageChangeCounts = await importPackage(skillPackage)
        await recordEvent('SkillPackageImport', { userId, orgId, meta: { packageId: skillPackage.id, changes: packageChangeCounts } })
    }

    const elapsedTime = Date.now() - startTime

    return { changeCounts, elapsedTime }
}


async function importPackage(skillPackage: SkillPackageDef) {
    
    const changeCounts = createChangeCounts(['packages', 'skillGroups', 'skills'])

    const storedPackage = await prisma.skillPackage.findFirst({ where: { id: skillPackage.id } })

    if(storedPackage) { // Existing package

        if(skillPackage.name != storedPackage.name || skillPackage.ref != storedPackage.ref) {
            await prisma.skillPackage.update({
                where: { id: skillPackage.id },
                data: _.pick(skillPackage, ['name', 'ref'])
            })
            changeCounts.packages.update++
        }
    } else { // New package
        await prisma.skillPackage.create({
            data: _.pick(skillPackage, ['id', 'name', 'ref'])
        })
        changeCounts.packages.create++
    }

    const storedGroups = await prisma.skillGroup.findMany({ where: { packageId: skillPackage.id } })
    const groupsToImport = getGroupsInPackage(skillPackage)

    // Skill Groups that are in the sample set but not in the stored set
    const groupsToAdd = _.differenceBy(groupsToImport, storedGroups, (c) => c.id)

    if(groupsToAdd.length > 0) {
        await prisma.skillGroup.createMany({
            data: groupsToAdd.map(group => _.pick(group, ['id', 'ref', 'name', 'packageId', 'parentId']))
        })
        changeCounts.skillGroups.create = groupsToAdd.length
    }

    // Skill Groups that could need updating
    for(const group of groupsToImport) {
        const storedGroup = storedGroups.find(c => c.id == group.id)
        if(!storedGroup) continue // New group

        if(group.name != storedGroup.name) {
            await prisma.skillGroup.update({
                where: { id: group.id },
                data: _.pick(group, ['name', 'ref', 'packageId', 'parentId'])
            })
            changeCounts.skillGroups.update++
        }
    }

    const storedSkills = await prisma.skill.findMany({ where: { packageId: skillPackage.id }})
    const skillsToImport = getSkillsInPackage(skillPackage)

    // Skills that are in the sample set but not in the stored set
    const skillsToAdd = _.differenceBy(skillsToImport, storedSkills, (c) => c.id)

    if(skillsToAdd.length > 0) {
        await prisma.skill.createMany({
            data: skillsToAdd.map(skill => _.pick(skill, ['id', 'name', 'ref', 'description', 'frequency', 'optional', 'packageId', 'skillGroupId']))
        })
        changeCounts.skills.create = skillsToAdd.length
    }

    // Skills that could need updating
    for(const sampleSkill of skillsToImport) {
        const storedSkill = storedSkills.find(c => c.id == sampleSkill.id)
        if(!storedSkill) continue // New skill

        if(sampleSkill.name != storedSkill.name || sampleSkill.ref != storedSkill.ref || sampleSkill.description != storedSkill.description || sampleSkill.frequency != storedSkill.frequency || sampleSkill.optional != storedSkill.optional) {
            await prisma.skill.update({
                where: { id: sampleSkill.id },
                data: _.pick(sampleSkill, ['name', 'ref', 'description', 'frequency', 'optional', 'skillGroupId'])
            })
            changeCounts.skills.update++
        }
    }

    return changeCounts
}
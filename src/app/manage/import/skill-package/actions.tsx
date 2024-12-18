'use server'

import _ from 'lodash'

import { getGroupsInPackage, getSkillsInPackage, PackageList } from '@/data/skills'
import prisma from '@/lib/prisma'
import { ChangeCountsByType, createEmptyChangeCounts as createChangeCounts } from '@/lib/change-counts'

export interface ImportPackageActionResult {
    changeCounts: ChangeCountsByType<'packages' | 'skillGroups' | 'skills'>
    elapsedTime: number
}


export async function importPackageAction(packageIds: string[]): Promise<ImportPackageActionResult> {

    const startTime = Date.now()
    const changeCounts = createChangeCounts(['packages', 'skillGroups', 'skills'])

    const storedPackages = await prisma.skillPackage.findMany()
    const storedGroups = await prisma.skillGroup.findMany()
    const storedSkills = await prisma.skill.findMany()

    const packagesToImport = PackageList.filter(pkg => packageIds.includes(pkg.id))
    const groupsToImport = packagesToImport.flatMap(getGroupsInPackage)
    const skillsToImport = packagesToImport.flatMap(getSkillsInPackage)

    // Packages that are in the sample set but not the stored set
    const packagesToAdd = _.differenceBy(packagesToImport, storedPackages, (c) => c.id)

    if(packagesToAdd.length > 0) {
        await prisma.skillPackage.createMany({
            data: packagesToAdd.map(capability => _.pick(capability, ['id', 'name', 'ref']))
        })
        changeCounts.packages.create = packagesToAdd.length
    }

    // Packages that could need updating
    for(const pkg of packagesToImport) {
        const storedPackage = storedPackages.find(c => c.id == pkg.id)
        if(!storedPackage) continue // New package

        if(pkg.name != storedPackage.name || pkg.ref != storedPackage.ref) {
            await prisma.skillPackage.update({
                where: { id: pkg.id },
                data: _.pick(pkg, ['name', 'ref'])
            })
            changeCounts.packages.update++
        }
    }

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


    const elapsedTime = Date.now() - startTime

    return { changeCounts, elapsedTime }
}
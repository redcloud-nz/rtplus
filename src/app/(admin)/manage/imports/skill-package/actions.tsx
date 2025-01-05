/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import _ from 'lodash'

import { auth } from '@clerk/nextjs/server'

import { getGroupsInPackage, getSkillsInPackage, PackageList, SkillPackageDef } from '@/data/skills'
import prisma from '@/lib/prisma'
import { ChangeCountsByType, createChangeCounts as createChangeCounts } from '@/lib/change-counts'
import { EventBuilder } from '@/lib/history'
import { assertNonNull } from '@/lib/utils'


export interface ImportPackageActionResult {
    changeCounts: ChangeCountsByType<'packages' | 'skillGroups' | 'skills'>
    elapsedTime: number
}

export async function importPackageAction(packageIds: string[]): Promise<ImportPackageActionResult> {

    const { userId, orgId } = await auth.protect({ role: 'org:admin' })
    assertNonNull(orgId, "An active organization is required to execute 'importPackageAction'")

    const startTime = Date.now()
    const changeCounts = createChangeCounts(['packages', 'skillGroups', 'skills'])

    const packagesToImport = PackageList.filter(pkg => packageIds.includes(pkg.id))

    // Packages that could need updating
    for(const skillPackage of packagesToImport) {
        const eventBuilder = EventBuilder.createGrouped(orgId, userId)

        await importPackage(skillPackage, eventBuilder)
        
    }

    const elapsedTime = Date.now() - startTime

    return { changeCounts, elapsedTime }
}


async function importPackage(skillPackage: SkillPackageDef, eventBuilder: EventBuilder) {

    await prisma.historyEvent.create({ data: eventBuilder.buildRootEvent('Import', 'SkillPackage', skillPackage.id) })
    
    const changeCounts = createChangeCounts(['packages', 'skillGroups', 'skills'])

    const storedPackage = await prisma.skillPackage.findFirst({ where: { id: skillPackage.id } })

    const skillPackageData = _.pick(skillPackage, ['name', 'ref'])

    if(storedPackage) { // Existing package
        if(skillPackage.name != storedPackage.name || skillPackage.ref != storedPackage.ref) {
            await prisma.$transaction([
                prisma.skillPackage.update({ 
                    where: { id: skillPackage.id }, 
                    data: skillPackageData 
                }),
                prisma.historyEvent.create({ 
                    data: eventBuilder.buildEvent('Update', 'SkillPackage', skillPackage.id)
                })
            ])
            changeCounts.packages.update++
        }
    } else { // New package
        await prisma.$transaction([
            prisma.skillPackage.create({ 
                data: skillPackageData
            }),
            prisma.historyEvent.create({ 
                data: eventBuilder.buildEvent('Create', 'SkillPackage', skillPackage.id)
            })
        ])
        changeCounts.packages.create++
    }

    const storedGroups = await prisma.skillGroup.findMany({ where: { packageId: skillPackage.id } })
    const groupsToImport = getGroupsInPackage(skillPackage)

    // Skill Groups that are in the sample set but not in the stored set
    const groupsToAdd = _.differenceBy(groupsToImport, storedGroups, (c) => c.id)

    if(groupsToAdd.length > 0) {
        await prisma.$transaction([
            prisma.skillGroup.createMany({ 
                data: groupsToAdd.map(group => _.pick(group, ['id', 'ref', 'name', 'packageId', 'parentId'])) 
            }),
            prisma.historyEvent.createMany({ 
                data: groupsToAdd.map(group => eventBuilder.buildEvent('Create', 'SkillGroup', group.id)) 
            })
        ])
        changeCounts.skillGroups.create = groupsToAdd.length
    }

    // Skill Groups that could need updating
    for(const group of groupsToImport) {
        const storedGroup = storedGroups.find(c => c.id == group.id)
        if(!storedGroup) continue // New group

        if(group.name != storedGroup.name) {
            await prisma.$transaction([
                prisma.skillGroup.update({
                    where: { id: group.id },
                    data: _.pick(group, ['name', 'ref', 'packageId', 'parentId'])
                }),
                prisma.historyEvent.create({ 
                    data: eventBuilder.buildEvent('Update', 'SkillGroup', group.id) 
                })
            ])
            changeCounts.skillGroups.update++
        }
    }

    const storedSkills = await prisma.skill.findMany({ where: { packageId: skillPackage.id }})
    const skillsToImport = getSkillsInPackage(skillPackage)

    // Skills that are in the sample set but not in the stored set
    const skillsToAdd = _.differenceBy(skillsToImport, storedSkills, (c) => c.id)

    if(skillsToAdd.length > 0) {
        await prisma.$transaction([
            prisma.skill.createMany({
                data: skillsToAdd.map(skill => _.pick(skill, ['id', 'name', 'ref', 'description', 'frequency', 'optional', 'packageId', 'skillGroupId']))
            }),
            prisma.historyEvent.createMany({ 
                data: skillsToAdd.map(skill => eventBuilder.buildEvent('Create', 'Skill', skill.id)) 
            })
        ])
        
        changeCounts.skills.create = skillsToAdd.length
    }

    // Skills that could need updating
    for(const skill of skillsToImport) {
        const storedSkill = storedSkills.find(c => c.id == skill.id)
        if(!storedSkill) continue // New skill

        if(skill.name != storedSkill.name || skill.ref != storedSkill.ref || skill.description != storedSkill.description || skill.frequency != storedSkill.frequency || skill.optional != storedSkill.optional) {
            await prisma.$transaction([
                prisma.skill.update({
                    where: { id: skill.id },
                    data: _.pick(skill, ['name', 'ref', 'description', 'frequency', 'optional', 'skillGroupId'])
                }),
                prisma.historyEvent.create({ 
                    data: eventBuilder.buildEvent('Update', 'Skill', skill.id)
                })
            ])
            await 
            changeCounts.skills.update++
        }
    }

    return changeCounts
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import * as R from 'remeda'

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

/**
 * Action to import a set of skill packages.
 * @param packageIds IDs of the packages to import
 * @returns The result of the import action
 */
export async function importPackagesAction(packageIds: string[]): Promise<ImportPackageActionResult> {

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


/**
 * Import a single skill package.
 * @param skillPackage The skill package to import
 * @param eventBuilder The event builder to use for creating history events
 */
async function importPackage(skillPackage: SkillPackageDef, eventBuilder: EventBuilder) {

    await prisma.historyEvent.create({ data: eventBuilder.buildRootEvent('Import', 'SkillPackage', skillPackage.id) })
    
    const changeCounts = createChangeCounts(['packages', 'skillGroups', 'skills'])

    const packageData = R.pick(skillPackage, ['id', 'name', 'ref'])

    const storedPackage = await prisma.skillPackage.findFirst({ where: { id: skillPackage.id } })

    if(storedPackage != null) { // Existing package
        const existingData = R.pick(storedPackage, ['id', 'name', 'ref'])

        if(!R.isShallowEqual(packageData, existingData)) {
            // Only update if one of the fields has changed
            await prisma.$transaction([
                prisma.skillPackage.update({ 
                    where: { id: skillPackage.id }, 
                    data: packageData
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
                data: packageData
            }),
            prisma.historyEvent.create({ 
                data: eventBuilder.buildEvent('Create', 'SkillPackage', skillPackage.id)
            })
        ])
        changeCounts.packages.create++
    }

    // Groups that currently exist in the database
    const storedGroups = await prisma.skillGroup.findMany({ where: { packageId: skillPackage.id } })

    // Groups that are in the imported package
    const groupsToImport = getGroupsInPackage(skillPackage)

    // Skill Groups that are in the sample set but not in the stored set
    const groupsToAdd = R.differenceWith(groupsToImport, storedGroups, (a, b) => a.id == b.id)

    for(const group of groupsToAdd) {
        await prisma.$transaction([
            prisma.skillGroup.create({ 
                data: R.pick(group, ['id', 'ref', 'name', 'packageId', 'parentId']) 
            }),
            prisma.historyEvent.create({ 
                data: eventBuilder.buildEvent('Create', 'SkillGroup', group.id) 
            })
        ])
    }
    changeCounts.skillGroups.create = groupsToAdd.length


    // Skill Groups that could need updating
    for(const group of groupsToImport) {
        const storedGroup = storedGroups.find(c => c.id == group.id)
        if(!storedGroup) continue // New group

        if(group.name != storedGroup.name) {
            await prisma.$transaction([
                prisma.skillGroup.update({
                    where: { id: group.id },
                    data: R.pick(group, ['name', 'ref', 'packageId', 'parentId'])
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
    const skillsToAdd = R.differenceWith(skillsToImport, storedSkills, (a, b) => a.id == b.id)

    if(skillsToAdd.length > 0) {
        await prisma.$transaction([
            prisma.skill.createMany({
                data: skillsToAdd.map(R.pick(['id', 'name', 'ref', 'description', 'frequency', 'optional', 'packageId', 'skillGroupId']))
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
                    data: R.pick(skill, ['name', 'ref', 'description', 'frequency', 'optional', 'skillGroupId'])
                }),
                prisma.historyEvent.create({ 
                    data: eventBuilder.buildEvent('Update', 'Skill', skill.id)
                })
            ])
            changeCounts.skills.update++
        }
    }

    return changeCounts
}
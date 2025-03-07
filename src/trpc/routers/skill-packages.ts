/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import * as R from 'remeda'
import { z } from 'zod'

import { PackageList, SkillPackageDef } from '@/data/skills'
import { ChangeCountsByType, createChangeCounts } from '@/lib/change-counts'
import { assertNonNull } from '@/lib/utils'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, systemAdminProcedure } from '../init'


export const skillPackagesRouter = createTRPCRouter({
    all: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.skillPackage.findMany({ 
                where: { status: 'Active' },
                orderBy: { name: 'asc' },
                include: {
                    skillGroups: true,
                    skills: true
                }
            })
        }),

    byId: authenticatedProcedure
        .input(z.object({
            skillPackageId: z.string().uuid()
        }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.skillPackage.findUnique({ 
                where: { id: input.skillPackageId },
                include: {
                    skillGroups: true,
                    skills: true
                }
            })
        }), 
    import: systemAdminProcedure
        .input(z.object({
            skillPackageId: z.string().uuid()
        }))
        .mutation(async ({ ctx, input }) => {
        
            const startTime = Date.now()

            const packageToImport = PackageList.find(pkg => pkg.id == input.skillPackageId)
            assertNonNull(packageToImport, `No such SkillPackage with id = ${input.skillPackageId}`)


            const changeCounts = await importPackage(ctx, packageToImport)

            const elapsedTime = Date.now() - startTime

            return { changeCounts: changeCounts, elapsedTime }
        }),
})



async function importPackage(ctx: AuthenticatedContext, skillPackage: SkillPackageDef): Promise<ChangeCountsByType<'skillPackages' | 'skillGroups' | 'skills'>> {
    const changeCounts = createChangeCounts(['skillPackages', 'skillGroups', 'skills'])

    const storedPackage = await ctx.prisma.skillPackage.findUnique({ where: { id: skillPackage.id } })

    if(storedPackage) {
        // Existing Package
        const existingData = R.pick(storedPackage, ['name', 'slug', 'sequence'])
        const changes = R.pipe(
            skillPackage, 
            R.pick(['name', 'slug', 'sequence']),
            R.entries(), 
            R.filter(([key, value]) => value !== existingData[key]),
            R.fromEntries()
        )

        if(!R.isEmpty(changes)) {
            // Only update if one of the fields has changed
            await ctx.prisma.skillPackage.update({ 
                where: { id: skillPackage.id }, 
                data: {
                    ...changes,
                    changeLogs: {
                        create: {
                            event: 'Update',
                            actorId: ctx.personId,
                            timestamp: new Date(),
                            fields: changes,
                            description: "Imported skill package"
                        }
                    }
                }
            })
            changeCounts.skillPackages.update++
        }
    } else {
        // New Package
        const fields = R.pick(skillPackage, ['id', 'name', 'slug', 'sequence'])

        await ctx.prisma.skillPackage.create({ 
            data: {
                ...fields,
                changeLogs: {
                    create: {
                        event: 'Create',
                        actorId: ctx.personId,
                        timestamp: new Date(),
                        fields: fields,
                        description: "Import skill package"
                    }
                }
            }
        })
        changeCounts.skillPackages.create++
    }

    // Groups that currently exist in the database
    const storedGroups = await ctx.prisma.skillGroup.findMany({ where: { skillPackageId: skillPackage.id } })

    // Groups that are in the imported package
    const groupsToImport = skillPackage.skillGroups

    // Skill Groups that are in the sample set but not in the stored set
    const groupsToAdd = R.pipe(
        groupsToImport, 
        R.differenceWith(storedGroups, (a, b) => a.id == b.id),
        R.map(R.omit(['skills', 'subGroups']))
    )

    if(groupsToAdd.length > 0) {
        const timestamp = new Date()
        await ctx.prisma.$transaction([
            ctx.prisma.skillGroup.createMany({ 
                data: groupsToAdd.map(group => ({
                    ...group,
                    skillPackageId: skillPackage.id
                }))
            }),
            ctx.prisma.skillPackageChangeLog.createMany({ 
                data: groupsToAdd.map(group => ({
                    event: 'CreateGroup',
                    actorId: ctx.personId,
                    skillPackageId: group.skillPackageId,
                    timestamp,
                    fields: group,
                    description: "Import skill package"
                }))
            })
        ])
        changeCounts.skillGroups.create = groupsToAdd.length
    }

    // Skill Groups that could need updating
    for(const group of groupsToImport) {
        const storedGroup = storedGroups.find(c => c.id == group.id)
        if(!storedGroup) continue // New group

        const changes = R.pipe(
            group, 
            R.pick(['name', 'slug', 'sequence', 'parentId']),
            R.entries(), 
            R.filter(([key, value]) => value !== storedGroup[key]),
            R.fromEntries()
        )

        if(!R.isEmpty(changes)) {
            await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.update({
                    where: { id: group.id },
                    data: changes
                }),
                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        event: 'UpdateGroup',
                        actorId: ctx.personId,
                        skillPackageId: group.skillPackageId,
                        timestamp: new Date(),
                        fields: changes,
                        description: "Imported skill package"
                    }
                })
            ])
            changeCounts.skillGroups.update++
        }
    }

    // Skills that currently exist in the database
    const storedSkills = await ctx.prisma.skill.findMany({ where: { skillPackageId: skillPackage.id }})

    // Skills that are in the imported package
    const skillsToImport = R.pipe(skillPackage.skillGroups, R.flatMap(group => group.skills))

    // Skills that are in the sample set but not in the stored set
    const skillsToAdd = R.pipe(
        skillsToImport, 
        R.differenceWith(storedSkills, (a, b) => a.id == b.id),
    )

    if(skillsToAdd.length > 0) {
        const timestamp = new Date()
        await ctx.prisma.$transaction([
            ctx.prisma.skill.createMany({
                data: skillsToAdd.map(skill => ({
                    ...skill,
                    skillPackageId: skillPackage.id
                }))
            }),
            ctx.prisma.skillPackageChangeLog.createMany({ 
                data: skillsToAdd.map(skill => ({
                    event: 'CreateSkill',
                    actorId: ctx.personId,
                    skillPackageId: skillPackage.id,
                    timestamp,
                    fields: { ...skill },
                    description: "Import skill package"
                }))
            })
        ])
        
        changeCounts.skills.create += skillsToAdd.length
    }

    // Skills that could need updating
    for(const skill of skillsToImport) {
        const storedSkill = storedSkills.find(c => c.id == skill.id)
        if(!storedSkill) continue // New skill

        const changes = R.pipe(
            skill, 
            R.pick(['name', 'sequence', 'description', 'skillGroupId']),
            R.entries(), 
            R.filter(([key, value]) => value !== storedSkill[key]),
            R.fromEntries()
        )

        if(!R.isEmpty(changes)) {
            await ctx.prisma.$transaction([
                ctx.prisma.skill.update({
                    where: { id: skill.id },
                    data: changes
                }),
                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        event: 'UpdateSkill',
                        actorId: ctx.personId,
                        skillPackageId: skillPackage.id,
                        timestamp: new Date(),
                        fields: changes,
                        description: "Imported skill package"
                    }
                })
            ])
            changeCounts.skills.update
        }
    }

    // TODO - Delete skills that are no longer in the package

    return changeCounts
}
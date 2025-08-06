/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { differenceWith, entries, filter, flatMap, fromEntries, isEmpty, map, omit, pick, pickBy, pipe } from 'remeda'
import { z } from 'zod'

import { SkillPackage as SkillPackageRecord } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { PackageList, SkillPackageDef } from '@/data/skills'
import { ChangeCountsByType, createChangeCounts } from '@/lib/change-counts'
import { skillPackageSchema } from '@/lib/schemas/skill-package'
import { nanoId16 } from '@/lib/id'
import { assertNonNull } from '@/lib/utils'
import { zodNanoId8, zodRecordStatus } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, systemAdminProcedure } from '../init'


export const skillPackagesRouter = createTRPCRouter({

    all: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus
        }))
        .output(z.array(skillPackageSchema.extend({
            _count: z.object({
                skillGroups: z.number(),
                skills: z.number()
            })
        })))
        .query(async ({ ctx, input }) => {
            const skillPackages = await ctx.prisma.skillPackage.findMany({ 
                where: { status: { in: input.status } },
                orderBy: { sequence: 'asc' },
                include: {
                    _count: {
                        select: { skillGroups: {
                            where: { status: { in: input.status } }
                        }, 
                        skills: {
                            where: { status: { in: input.status } }
                        } }
                    }
                }
            })

            return skillPackages.map(pkg => ({ skillPackageId: pkg.id, ...pkg }))
        }),

    byId: authenticatedProcedure
        .input(z.object({
            skillPackageId: zodNanoId8
        }))
        .output(skillPackageSchema)
        .query(async ({ ctx, input: { skillPackageId} }) => {
            const skillPackage = await getSkillPackageById(ctx, skillPackageId)

            return { skillPackageId, ...skillPackage }
        }), 

    create: systemAdminProcedure
        .input(skillPackageSchema)
        .output(skillPackageSchema)
        .mutation(async ({ ctx, input: { skillPackageId, ...input } }) => {
            const aggregations = await ctx.prisma.skillPackage.aggregate({
                _max: { sequence: true },
            })

            const fields = {
                name: input.name,
                sequence: (aggregations._max.sequence ?? 0) + 1,
                status: input.status,
            }

            const created = await ctx.prisma.skillPackage.create({
                data: {
                    id: skillPackageId,
                    ...fields ,
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'Create',
                            actorId: ctx.personId,
                            timestamp: new Date(),
                            fields: { ...fields },
                        }
                    }
                },
            })

            return { skillPackageId, ...created }
        }),

    current: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.skillPackage.findMany({ 
                where: { status: 'Active' },
                orderBy: { sequence: 'asc' },
                include: {
                    skillGroups: {
                        where: { status: 'Active' },
                        orderBy: { sequence: 'asc' },
                    },
                    skills: {
                        where: { status: 'Active' },
                        orderBy: { sequence: 'asc' },
                    }
                }
            })
        }),

    delete: systemAdminProcedure
        .input(z.object({
            skillPackageId: zodNanoId8
        }))
        .output(skillPackageSchema)
        .mutation(async ({ ctx, input: { skillPackageId} }) => {
            const existing = await getSkillPackageById(ctx, skillPackageId)
            if(!existing) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `SkillPackage(${skillPackageId}) not found` })
            }

            const deleted = await ctx.prisma.skillPackage.delete({ where: { id: skillPackageId } })

            return { skillPackageId, ...deleted }
        }),
    

    import: systemAdminProcedure
        .input(z.object({
            skillPackageId: zodNanoId8
        }))
        .mutation(async ({ ctx, input }) => {
        
            const startTime = Date.now()

            const packageToImport = PackageList.find(pkg => pkg.id == input.skillPackageId)
            assertNonNull(packageToImport, `No such SkillPackage with id = ${input.skillPackageId}`)


            const changeCounts = await importPackage(ctx, packageToImport)

            const elapsedTime = Date.now() - startTime

            return { changeCounts: changeCounts, elapsedTime }
        }),
    
    update: systemAdminProcedure
        .input(skillPackageSchema)
        .output(skillPackageSchema)
        .mutation(async ({ ctx, input: { skillPackageId, ...update } }) => {
            const existing = await getSkillPackageById(ctx, skillPackageId)

            // Pick only the fields that have changed
            const changedFields = pickBy(update, (value, key) => value != existing[key])

            const updated = await ctx.prisma.skillPackage.update({
                where: { id: skillPackageId },
                data: {
                    ...changedFields,
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'Update',
                            actorId: ctx.personId,
                            timestamp: new Date(),
                            fields: changedFields,
                        }
                    }
                },
            })

            return { skillPackageId, ...updated }
        })
})


export async function getSkillPackageById(ctx: AuthenticatedContext, skillPackageId: string): Promise<SkillPackageRecord> {
    const skillPackage = await ctx.prisma.skillPackage.findUnique({ 
            where: { id: skillPackageId },
        })

        if(!skillPackage) {
            throw new TRPCError({ 
                code: 'NOT_FOUND', 
                message: `SkillPackage(${skillPackageId}) not found` 
            })
        }
        return skillPackage
}


async function importPackage(ctx: AuthenticatedContext, skillPackage: SkillPackageDef): Promise<ChangeCountsByType<'skillPackages' | 'skillGroups' | 'skills'>> {
    const changeCounts = createChangeCounts(['skillPackages', 'skillGroups', 'skills'])

    const storedPackage = await ctx.prisma.skillPackage.findUnique({ where: { id: skillPackage.id } })

    if(storedPackage) {
        // Existing Package
        const existingData = pick(storedPackage, ['name', 'id', 'sequence'])
        const changes = pipe(
            skillPackage, 
            pick(['name', 'id', 'sequence']),
            entries(), 
            filter(([key, value]) => value !== existingData[key]),
            fromEntries()
        )

        if(!isEmpty(changes)) {
            // Only update if one of the fields has changed
            await ctx.prisma.skillPackage.update({ 
                where: { id: skillPackage.id }, 
                data: {
                    ...changes,
                    changeLogs: {
                        create: {
                            id: nanoId16(),
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
        const fields = pick(skillPackage, ['id', 'name', 'sequence'])

        await ctx.prisma.skillPackage.create({ 
            data: {
                ...fields,
                changeLogs: {
                    create: {
                        id: nanoId16(),
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
    const groupsToAdd = pipe(
        groupsToImport, 
        differenceWith(storedGroups, (a, b) => a.id == b.id),
        map(omit(['skills', 'subGroups']))
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
                    id: nanoId16(),
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

        const changes = pipe(
            group, 
            pick(['name', 'sequence', 'parentId']),
            entries(), 
            filter(([key, value]) => value !== storedGroup[key]),
            fromEntries()
        )

        if(!isEmpty(changes)) {
            await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.update({
                    where: { id: group.id },
                    data: changes
                }),
                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
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
    const skillsToImport = pipe(skillPackage.skillGroups, flatMap(group => group.skills))

    // Skills that are in the sample set but not in the stored set
    const skillsToAdd = pipe(
        skillsToImport, 
        differenceWith(storedSkills, (a, b) => a.id == b.id),
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
                    id: nanoId16(),
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

        const changes = pipe(
            skill, 
            pick(['name', 'sequence', 'description', 'skillGroupId']),
            entries(), 
            filter(([key, value]) => value !== storedSkill[key]),
            fromEntries()
        )

        if(!isEmpty(changes)) {
            await ctx.prisma.$transaction([
                ctx.prisma.skill.update({
                    where: { id: skill.id },
                    data: changes
                }),
                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        event: 'UpdateSkill',
                        actorId: ctx.personId,
                        skillPackageId: skillPackage.id,
                        timestamp: new Date(),
                        fields: changes,
                        description: "Imported skill package"
                    }
                })
            ])
            changeCounts.skills.update++
        }
    }

    // TODO - Delete skills that are no longer in the package

    return changeCounts
}
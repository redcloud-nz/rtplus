/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { differenceWith, entries, filter, flatMap, fromEntries, isEmpty, map, omit, pick, pickBy, pipe } from 'remeda'
import { z } from 'zod'

import { Skill as SkillRecord, SkillGroup as SkillGroupRecord, SkillPackage as SkillPackageRecord } from '@prisma/client'

import { skillSchema, toSkillData } from '@/lib/schemas/skill'
import { nanoId16 } from '@/lib/id'
import { zodNanoId8, zodRecordStatus } from '@/lib/validation'
import { TRPCError } from '@trpc/server'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, systemAdminProcedure } from '../init'
import { skillGroupSchema, toSkillGroupData } from '@/lib/schemas/skill-group'
import { skillPackageSchema, toSkillPackageData } from '@/lib/schemas/skill-package'
import { ChangeCountsByType, createChangeCounts } from '@/lib/change-counts'
import { PackageList, SkillPackageDef } from '@/data/skills'
import { assertNonNull } from '@/lib/utils'
import { TeamId } from '@/lib/schemas/team'


export const skillsRouter = createTRPCRouter({

    createGroup: systemAdminProcedure
        .input(skillGroupSchema)
        .output(skillGroupSchema)
        .mutation(async ({ ctx, input: { skillPackageId, skillGroupId, ...input} }) => {
            const aggregations = await ctx.prisma.skillGroup.aggregate({
                where: { skillPackageId },
                _max: { sequence: true }
            })

            const fields = { ...input, sequence: (aggregations._max.sequence ?? 0) + 1 }

            const [created] = await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.create({
                    data: {
                        id: skillGroupId,
                        skillPackageId,
                        ...fields,
                    },
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        skillPackageId,
                        event: 'CreateGroup',
                        actorId: ctx.auth.personId,
                        timestamp: new Date(),
                        meta: { skillGroupId },
                        fields: { ...fields },
                    }
                })
            ])

            return { skillGroupId, ...created }
        }),

    createPackage: systemAdminProcedure
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
                            actorId: ctx.auth.personId,
                            timestamp: new Date(),
                            fields: { ...fields },
                        }
                    }
                },
            })

            return { skillPackageId, ...created }
        }),

    createSkill: systemAdminProcedure
        .input(skillSchema)
        .output(skillSchema.extend({
            skillGroup: skillGroupSchema,
            skillPackage: skillPackageSchema
        }))
        .mutation(async ({ ctx, input: { skillPackageId, skillId, ...input } }) => {
            const aggregations = await ctx.prisma.skill.aggregate({
                where: { skillPackageId: skillPackageId, skillGroupId: input.skillGroupId },
                _max: { sequence: true }
            })

            const fields = { ...input, sequence: (aggregations._max.sequence ?? 0) + 1 }

            const [newSkill] = await ctx.prisma.$transaction([
                ctx.prisma.skill.create({
                    data: {
                        id: skillId,
                        skillPackageId,
                        ...fields,
                    },
                    include: {
                        skillPackage: true,
                        skillGroup: true,
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        skillPackageId: skillPackageId,
                        event: 'CreateSkill',
                        actorId: ctx.auth.personId,
                        timestamp: new Date(),
                        meta: { skillId },
                        fields: { ...fields },
                    }
                })
            ])

            return { skillId, ...newSkill, skillGroup: { skillGroupId: newSkill.skillGroup.id, ...newSkill.skillGroup }, skillPackage: { skillPackageId: newSkill.skillPackage.id, ...newSkill.skillPackage } }
        }),

    deleteGroup: systemAdminProcedure
        .input(z.object({
            skillGroupId: zodNanoId8,
            skillPackageId: zodNanoId8
        }))
        .output(skillGroupSchema)
        .mutation(async ({ ctx, input: { skillGroupId, skillPackageId } }) => {
            const skillGroup = await getSkillGroupById(ctx, skillPackageId, skillGroupId)

            const [deleted] = await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.delete({
                    where: { id: skillGroupId },
                    include: {
                        skillPackage: true,
                        parent: true,
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        skillPackageId: skillGroup.skillPackageId,
                        event: 'DeleteGroup',
                        actorId: ctx.auth.personId,
                        timestamp: new Date(),
                        meta: { skillGroupId },
                    }
                })
            ])

            return { skillGroupId, ...deleted }
        }),

    deletePackage: systemAdminProcedure
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

    deleteSkill: systemAdminProcedure
        .input(z.object({
            skillId: zodNanoId8,
            skillPackageId: zodNanoId8
        }))
        .output(skillSchema.extend({
            skillGroup: skillGroupSchema,
            skillPackage: skillPackageSchema
        }))
        .mutation(async ({ ctx, input: { skillId, skillPackageId } }) => {
            const skill = await getSkillById(ctx, skillPackageId, skillId)

            const [deletedSkill] = await ctx.prisma.$transaction([
                ctx.prisma.skill.delete({
                    where: { id: skillId },
                    include: {
                        skillPackage: true,
                        skillGroup: true,
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        skillPackageId: skill.skillPackageId,
                        event: 'DeleteSkill',
                        actorId: ctx.auth.personId,
                        timestamp: new Date(),
                        meta: { skillId },
                    }
                })
            ])

            return { skillId, ...deletedSkill, skillGroup: { skillGroupId: deletedSkill.skillGroup.id, ...deletedSkill.skillGroup }, skillPackage: { skillPackageId: deletedSkill.skillPackage.id, ...deletedSkill.skillPackage } }
        }),

    getAvailablePackages: authenticatedProcedure
        .input(z.object({
            teamId: TeamId.schema
        }))
        .output(z.array(skillPackageSchema.extend({
            skillGroups: z.array(skillGroupSchema),
            skills: z.array(skillSchema)
        })))
        .query(async ({ ctx }) => {
            const skillPackages = await ctx.prisma.skillPackage.findMany({ 
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

            return skillPackages.map(pkg => ({
                ...toSkillPackageData(pkg),
                skillGroups: pkg.skillGroups.map(toSkillGroupData),
                skills: pkg.skills.map(toSkillData),
            }))
        }),

    getGroup: authenticatedProcedure
        .input(z.object({
            skillGroupId: zodNanoId8,
            skillPackageId: zodNanoId8
        }))
        .output(skillGroupSchema.extend({
            skillPackage: skillPackageSchema
        }))
        .query(async ({ ctx, input: { skillGroupId, skillPackageId } }) => {
            const { skillPackage, ...group } = await getSkillGroupById(ctx, skillPackageId, skillGroupId)

            return { skillGroupId, ...group, skillPackage: { skillPackageId, ...skillPackage } }
        }),

    getGroups: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus,
            skillPackageId: zodNanoId8.optional()
        }))
        .output(z.array(skillGroupSchema))
        .query(async ({ ctx, input }) => {
            const groups = await ctx.prisma.skillGroup.findMany({ 
                where: { status: { in: input.status }, skillPackageId: input.skillPackageId },
                orderBy: { sequence: 'asc' },
            })

            return groups.map(group => ({ skillGroupId: group.id, ...group }))
        }),

    getPackage: authenticatedProcedure
        .input(z.object({
            skillPackageId: zodNanoId8
        }))
        .output(skillPackageSchema)
        .query(async ({ ctx, input: { skillPackageId} }) => {
            const skillPackage = await getSkillPackageById(ctx, skillPackageId)

            return { skillPackageId, ...skillPackage }
        }), 

    getPackages: authenticatedProcedure
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

    getSkill: authenticatedProcedure
        .input(z.object({
            skillId: zodNanoId8,
            skillPackageId: zodNanoId8
        }))
        .output(skillSchema.extend({
            skillGroup: skillGroupSchema,
            skillPackage: skillPackageSchema
        }))
        .query(async ({ ctx, input: { skillId, skillPackageId } }) => {
            const { skillPackage, skillGroup, ...skill } = await getSkillById(ctx, skillPackageId, skillId)

            return { skillId, ...skill, skillPackage: { skillPackageId, ...skillPackage }, skillGroup: { skillGroupId: skillGroup.id, ...skillGroup } }
        }),

    getSkills: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus,
            skillPackageId: zodNanoId8.optional(),
            skillGroupId: zodNanoId8.optional(),
        }))
        .output(z.array(skillSchema))
        .query(async ({ ctx, input }) => {
            const skills = await ctx.prisma.skill.findMany({ 
                where: { 
                    status: { in: input.status },
                    skillPackageId: input.skillPackageId,
                    skillGroupId: input.skillGroupId,
                },
                orderBy: { sequence: 'asc' },
            })
            return skills.map(skill => ({ skillId: skill.id, ...skill }))
        }),

    


    importPackage: systemAdminProcedure
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

    updateGroup: systemAdminProcedure
        .input(skillGroupSchema)
        .output(skillGroupSchema)
        .mutation(async ({ ctx, input: { skillGroupId, skillPackageId, ...input} }) => {
            const existing = await getSkillGroupById(ctx, skillPackageId, skillGroupId)

            const changedFields = pickBy(input, (value, key) => value != existing[key])

            const [updated] = await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.update({
                    where: { id: skillGroupId },
                    data: changedFields,
                    include: {
                        skillPackage: true,
                        parent: true,
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        skillPackageId: existing.skillPackageId,
                        event: 'UpdateGroup',
                        actorId: ctx.auth.personId,
                        timestamp: new Date(),
                        meta: { skillGroupId },
                        fields: changedFields, 
                    }
                })
            ])

            return { skillGroupId, ...updated }
        }),

    
    updatePackage: systemAdminProcedure
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
                            actorId: ctx.auth.personId,
                            timestamp: new Date(),
                            fields: changedFields,
                        }
                    }
                },
            })

            return { skillPackageId, ...updated }
        }),

    updateSkill: systemAdminProcedure
        .input(skillSchema)
        .output(skillSchema.extend({
            skillGroup: skillGroupSchema,
            skillPackage: skillPackageSchema
        }))
        .mutation(async ({ ctx, input: { skillPackageId, skillId, ...input } }) => {
            const skill = await getSkillById(ctx, skillPackageId, skillId)

            const changedFields = pickBy(input, (value, key) => value != skill[key])

            const [updatedSkill] = await ctx.prisma.$transaction([
                ctx.prisma.skill.update({
                    where: { id: skillId },
                    data: changedFields,
                    include: {
                        skillPackage: true,
                        skillGroup: true,
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        skillPackageId,
                        event: 'UpdateSkill',
                        actorId: ctx.auth.personId,
                        timestamp: new Date(),
                        meta: { skillId },
                        fields: changedFields,
                    }
                })
            ])

            return { skillId, ...updatedSkill, skillGroup: { skillGroupId: updatedSkill.skillGroup.id, ...updatedSkill.skillGroup }, skillPackage: { skillPackageId: updatedSkill.skillPackage.id, ...updatedSkill.skillPackage } }
        })
})


export async function getSkillById(ctx: AuthenticatedContext, skillPackageId: string, skillId: string): Promise<SkillRecord & { skillGroup: SkillGroupRecord, skillPackage: SkillPackageRecord }> {
    const skill = await ctx.prisma.skill.findUnique({
        where: { id: skillId, skillPackageId},
        include: {
            skillPackage: true,
            skillGroup: true,
        }
    })

    if (!skill) throw new TRPCError({ code: 'NOT_FOUND', message: `Skill(${skillId}) not found`})

    return skill
}

export async function getSkillGroupById(ctx: AuthenticatedContext, skillPackageId: string, skillGroupId: string): Promise<SkillGroupRecord & { skillPackage: SkillPackageRecord }> {
    const skillGroup = await ctx.prisma.skillGroup.findUnique({
        where: { id: skillGroupId, skillPackageId },
        include: {
            skillPackage: true,
            parent: true,
        },
    })

    if (!skillGroup) throw new TRPCError({ code: 'NOT_FOUND', message: `SkillGroup(${skillGroupId}) not found`})

    return skillGroup
}

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
                            actorId: ctx.auth.personId,
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
                        actorId: ctx.auth.personId,
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
                    actorId: ctx.auth.personId,
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
                        actorId: ctx.auth.personId,
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
                    actorId: ctx.auth.personId,
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
                        actorId: ctx.auth.personId,
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
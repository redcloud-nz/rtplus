/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { differenceWith, entries, filter, flatMap, fromEntries, isEmpty, map, omit, pick, pickBy, pipe } from 'remeda'
import { z } from 'zod'

import { Skill as SkillRecord, SkillGroup as SkillGroupRecord, SkillPackage as SkillPackageRecord } from '@prisma/client'

import { PackageList, SkillPackageDef } from '@/data/skills'
import { ChangeCountsByType, createChangeCounts } from '@/lib/change-counts'
import { diffObject } from '@/lib/diff'
import { skillSchema, toSkillData } from '@/lib/schemas/skill'
import { SkillGroupId, skillGroupSchema, toSkillGroupData } from '@/lib/schemas/skill-group'
import { SkillPackageId, skillPackageSchema, toSkillPackageData } from '@/lib/schemas/skill-package'
import { TeamId } from '@/lib/schemas/team'
import { assertNonNull } from '@/lib/utils'
import { zodNanoId8, recordStatusParameterSchema } from '@/lib/validation'
import { TRPCError } from '@trpc/server'

import { AuthenticatedContext, AuthenticatedOrgContext, authenticatedProcedure, createTRPCRouter, orgAdminProcedure, orgProcedure } from '../init'


export const skillsRouter = createTRPCRouter({

    createGroup: orgAdminProcedure
        .input(skillGroupSchema)
        .output(skillGroupSchema)
        .mutation(async ({ ctx, input: { skillPackageId, skillGroupId, ...input} }) => {
            const skillPackage = await getSkillPackageById(ctx, skillPackageId)

            if(skillPackage.ownerOrgId != ctx.auth.activeOrg.orgId) throw new TRPCError({ code: 'FORBIDDEN', message: `You do not have permission to modify SkillPackage(${skillPackageId})` })

            const aggregations = await ctx.prisma.skillGroup.aggregate({
                where: { skillPackageId },
                _max: { sequence: true }
            })

            const fields = { ...input, sequence: (aggregations._max.sequence ?? 0) + 1 }

            const changes = diffObject({ tags: [], properties: {}, status: 'Active' }, fields)

            const [created] = await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.create({
                    data: {
                        skillGroupId,
                        skillPackageId,
                        ...fields,
                    },
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        skillPackageId,
                        event: 'CreateGroup',
                        userId: ctx.auth.userId,
                        timestamp: new Date(),
                        meta: { skillGroupId },
                        changes: changes as object[],
                    }
                })
            ])

            return toSkillGroupData(created)
        }),

    createPackage: orgAdminProcedure
        .input(skillPackageSchema.omit({ ownerOrgId: true }))
        .output(skillPackageSchema)
        .mutation(async ({ ctx, input: { skillPackageId, ...input } }) => {
            const aggregations = await ctx.prisma.skillPackage.aggregate({
                _max: { sequence: true },
            })

            const fields = { ...input, sequence: (aggregations._max.sequence ?? 0) + 1 }

            const changes = diffObject({ tags: [], properties: {}, status: 'Active' }, fields)

            const created = await ctx.prisma.skillPackage.create({
                data: {
                    skillPackageId,
                    ownerOrgId: ctx.auth.activeOrg.orgId,
                    ...fields ,
                    changeLogs: {
                        create: {
                            event: 'Create',
                            userId: ctx.auth.userId,
                            timestamp: new Date(),
                            changes: changes as object[],
                        }
                    }
                },
            })

            return toSkillPackageData(created)
        }),

    createSkill: orgAdminProcedure
        .input(skillSchema)
        .output(skillSchema)
        .mutation(async ({ ctx, input: { skillPackageId, skillId, ...input } }) => {
            const skillPackage = await getSkillPackageById(ctx, skillPackageId)

            if(skillPackage.ownerOrgId != ctx.auth.activeOrg.orgId) throw new TRPCError({ code: 'FORBIDDEN', message: `You do not have permission to modify SkillPackage(${skillPackageId})` })

            const aggregations = await ctx.prisma.skill.aggregate({
                where: { skillPackageId: skillPackageId, skillGroupId: input.skillGroupId },
                _max: { sequence: true }
            })

            const fields = { ...input, sequence: (aggregations._max.sequence ?? 0) + 1 }

            const changes = diffObject({ tags: [], properties: {}, status: 'Active' }, fields)

            const [newSkill] = await ctx.prisma.$transaction([
                ctx.prisma.skill.create({
                    data: {
                        skillId,
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
                        skillPackageId: skillPackageId,
                        event: 'CreateSkill',
                        userId: ctx.auth.userId,
                        timestamp: new Date(),
                        meta: { skillId },
                        changes: changes as object[],
                    }
                })
            ])

            return toSkillData(newSkill)
        }),

    deleteGroup: orgAdminProcedure
        .input(z.object({
            skillGroupId: SkillGroupId.schema,
            skillPackageId: SkillPackageId.schema
        }))
        .output(skillGroupSchema)
        .mutation(async ({ ctx, input: { skillGroupId, skillPackageId } }) => {

            const skillGroup = await getSkillGroupById(ctx, skillPackageId, skillGroupId)

            if(skillGroup.skillPackage.ownerOrgId != ctx.auth.activeOrg.orgId) throw new TRPCError({ code: 'FORBIDDEN', message: `You do not have permission to modify SkillGroup(${skillGroupId})` })

            const [deleted] = await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.delete({
                    where: { skillGroupId },
                    include: {
                        skillPackage: true,
                        parent: true,
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        skillPackageId: skillGroup.skillPackageId,
                        event: 'DeleteGroup',
                        userId: ctx.auth.userId,
                        timestamp: new Date(),
                        meta: { skillGroupId },
                    }
                })
            ])

            return toSkillGroupData(deleted)
        }),

    deletePackage: orgAdminProcedure
        .input(z.object({
            skillPackageId: zodNanoId8
        }))
        .output(skillPackageSchema)
        .mutation(async ({ ctx, input: { skillPackageId} }) => {
            const skillPackage = await getSkillPackageById(ctx, skillPackageId)
            
            if(skillPackage.ownerOrgId != ctx.auth.activeOrg.orgId) throw new TRPCError({ code: 'FORBIDDEN', message: `You do not have permission to modify SkillPackage(${skillPackageId})` })

            const deleted = await ctx.prisma.skillPackage.delete({ where: { skillPackageId } })

            return toSkillPackageData(deleted)
        }),

    deleteSkill: orgAdminProcedure
        .input(z.object({
            skillId: zodNanoId8,
            skillPackageId: zodNanoId8
        }))
        .output(skillSchema)
        .mutation(async ({ ctx, input: { skillId, skillPackageId } }) => {


            const skill = await getSkillById(ctx, skillPackageId, skillId)

            if(skill.skillPackage.ownerOrgId != ctx.auth.activeOrg.orgId) throw new TRPCError({ code: 'FORBIDDEN', message: `You do not have permission to modify Skill(${skillId})` })

            const [deletedSkill] = await ctx.prisma.$transaction([
                ctx.prisma.skill.delete({
                    where: { skillId },
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        skillPackageId: skill.skillPackageId,
                        event: 'DeleteSkill',
                        userId: ctx.auth.userId,
                        timestamp: new Date(),
                        meta: { skillId },
                    }
                })
            ])

            return toSkillData(deletedSkill)
        }),

    getAvailablePackages: orgProcedure
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

    getGroup: orgProcedure
        .input(z.object({
            skillGroupId: SkillGroupId.schema,
            skillPackageId: SkillPackageId.schema
        }))
        .output(skillGroupSchema.extend({
            skillPackage: skillPackageSchema
        }))
        .query(async ({ ctx, input: { skillGroupId, skillPackageId } }) => {
            const { skillPackage, ...skillGroup} = await getSkillGroupById(ctx, skillPackageId, skillGroupId)

            return { ...toSkillGroupData(skillGroup), skillPackage: toSkillPackageData(skillPackage) }
        }),

    getGroups: orgProcedure
        .input(z.object({
            status: recordStatusParameterSchema,
            skillPackageId: zodNanoId8.optional()
        }))
        .output(z.array(skillGroupSchema))
        .query(async ({ ctx, input }) => {
            const groups = await ctx.prisma.skillGroup.findMany({ 
                where: { status: { in: input.status }, skillPackageId: input.skillPackageId },
                orderBy: { sequence: 'asc' },
            })

            return groups.map(toSkillGroupData)
        }),

    getPackage: orgProcedure
        .input(z.object({
            skillPackageId: zodNanoId8
        }))
        .output(skillPackageSchema)
        .query(async ({ ctx, input: { skillPackageId} }) => {
            const found = await getSkillPackageById(ctx, skillPackageId)
            return toSkillPackageData(found)
        }), 

    getPackages: orgProcedure
        .input(z.object({
            status: recordStatusParameterSchema,
            owner: z.enum(['any', 'org']).optional().default('any'),
        }))
        .output(z.array(skillPackageSchema.extend({
            _count: z.object({
                skillGroups: z.number(),
                skills: z.number()
            })
        })))
        .query(async ({ ctx, input }) => {
            const skillPackages = await ctx.prisma.skillPackage.findMany({ 
                where: { 
                    status: { in: input.status },
                    ownerOrgId: input.owner == 'org' ? ctx.auth.activeOrg.orgId : undefined
                },
                orderBy: { sequence: 'asc' },
                include: {
                    _count: {
                        select: { 
                            skillGroups: {
                                where: { status: { in: input.status } }
                            }, 
                            skills: {
                                where: { status: { in: input.status } }
                            }
                        }
                    }
                }
            })

            return skillPackages.map(skillPackage => ({ ...toSkillPackageData(skillPackage), _count: skillPackage._count }))
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

            return { ...toSkillData(skill), skillGroup: toSkillGroupData(skillGroup), skillPackage: toSkillPackageData(skillPackage) }
        }),

    getSkills: authenticatedProcedure
        .input(z.object({
            status: recordStatusParameterSchema,
            skillPackageId: zodNanoId8.optional(),
            skillGroupId: zodNanoId8.optional(),
            skillIds: z.array(zodNanoId8).optional(),
        }))
        .output(z.array(skillSchema))
        .query(async ({ ctx, input }) => {
            const skills = await ctx.prisma.skill.findMany({ 
                where: { 
                    status: { in: input.status },
                    skillPackageId: input.skillPackageId,
                    skillGroupId: input.skillGroupId,
                    skillId: input.skillIds ? { in: input.skillIds } : undefined
                },
                orderBy: { sequence: 'asc' },
            })
            return skills.map(toSkillData)
        }),

    


    importPackage: orgAdminProcedure
        .input(z.object({
            skillPackageId: zodNanoId8
        }))
        .mutation(async ({ ctx, input }) => {
        
            const startTime = Date.now()

            const packageToImport = PackageList.find(pkg => pkg.skillPackageId == input.skillPackageId)
            assertNonNull(packageToImport, `No such SkillPackage with id = ${input.skillPackageId}`)


            const changeCounts = await importPackage(ctx, packageToImport)

            const elapsedTime = Date.now() - startTime

            return { changeCounts: changeCounts, elapsedTime }
        }),

    updateGroup: orgAdminProcedure
        .input(skillGroupSchema)
        .output(skillGroupSchema)
        .mutation(async ({ ctx, input: { skillGroupId, skillPackageId, ...fields} }) => {
            const skillGroup = await getSkillGroupById(ctx, skillPackageId, skillGroupId)

            if(skillGroup.skillPackage.ownerOrgId != ctx.auth.activeOrg.orgId) throw new TRPCError({ code: 'FORBIDDEN', message: `You do not have permission to modify SkillGroup(${skillGroupId})` })

            const changes = diffObject(skillGroupSchema.omit({ skillGroupId: true, skillPackageId: true }).parse(skillGroup), fields)
            if(changes.length == 0) return toSkillGroupData(skillGroup) // No changes

            const [updated] = await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.update({
                    where: { skillGroupId },
                    data: fields,
                    include: {
                        skillPackage: true,
                        parent: true,
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        skillPackageId: skillGroup.skillPackageId,
                        event: 'UpdateGroup',
                        userId: ctx.auth.userId,
                        timestamp: new Date(),
                        meta: { skillGroupId },
                        changes: changes as object[],
                    }
                })
            ])

            return toSkillGroupData(updated)
        }),

    
    updatePackage: orgAdminProcedure
        .input(skillPackageSchema.omit({ ownerOrgId: true }))
        .output(skillPackageSchema)
        .mutation(async ({ ctx, input: { skillPackageId, ...fields } }) => {
            const skillPackage = await getSkillPackageById(ctx, skillPackageId)

            if(skillPackage.ownerOrgId != ctx.auth.activeOrg.orgId) throw new TRPCError({ code: 'FORBIDDEN', message: `You do not have permission to modify SkillPackage(${skillPackageId})` })

            const changes = diffObject(skillPackageSchema.omit({ skillPackageId: true, ownerOrgId: true }).parse(skillPackage), fields)
            if(changes.length == 0) return toSkillPackageData(skillPackage) // No changes

            const updated = await ctx.prisma.skillPackage.update({
                where: { skillPackageId },
                data: {
                    ...fields,
                    changeLogs: {
                        create: {
                            event: 'Update',
                            userId: ctx.auth.userId,
                            timestamp: new Date(),
                            changes: changes as object[],
                        }
                    }
                },
            })

            return toSkillPackageData(updated)
        }),

    updateSkill: orgAdminProcedure
        .input(skillSchema)
        .output(skillSchema)
        .mutation(async ({ ctx, input: { skillPackageId, skillId, ...fields } }) => {
            const skill = await getSkillById(ctx, skillPackageId, skillId)

            if(skill.skillPackage.ownerOrgId != ctx.auth.activeOrg.orgId) throw new TRPCError({ code: 'FORBIDDEN', message: `You do not have permission to modify Skill(${skillId})` })

            const changes = diffObject(skillSchema.omit({ skillId: true, skillPackageId: true }).parse(skill), fields)
            if(changes.length == 0) return toSkillData(skill) // No changes

            const [updatedSkill] = await ctx.prisma.$transaction([
                ctx.prisma.skill.update({
                    where: { skillId },
                    data: fields,
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        skillPackageId,
                        event: 'UpdateSkill',
                        userId: ctx.auth.userId,
                        timestamp: new Date(),
                        meta: { skillId },
                        changes: changes as object[],
                    }
                })
            ])

            return toSkillData(updatedSkill)
        })
})


export async function getSkillById(ctx: AuthenticatedContext, skillPackageId: string, skillId: string): Promise<SkillRecord & { skillGroup: SkillGroupRecord, skillPackage: SkillPackageRecord }> {
    const skill = await ctx.prisma.skill.findUnique({
        where: { skillId, skillPackageId },
        include: {
            skillPackage: true,
            skillGroup: true,
        }
    })

    if (!skill) throw new TRPCError({ code: 'NOT_FOUND', message: `Skill(${skillId}) not found`})

    return skill
}

export async function getSkillGroupById(ctx: AuthenticatedContext, skillPackageId: SkillPackageId, skillGroupId: SkillGroupId): Promise<SkillGroupRecord & { skillPackage: SkillPackageRecord }> {
    const skillGroup = await ctx.prisma.skillGroup.findUnique({
        where: { skillGroupId, skillPackageId },
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
            where: { skillPackageId },
        })

        if(!skillPackage) {
            throw new TRPCError({ code: 'NOT_FOUND', message: `SkillPackage(${skillPackageId}) not found` })
        }
        return skillPackage
}


async function importPackage(ctx: AuthenticatedOrgContext, skillPackage: SkillPackageDef): Promise<ChangeCountsByType<'skillPackages' | 'skillGroups' | 'skills'>> {
    const changeCounts = createChangeCounts(['skillPackages', 'skillGroups', 'skills'])

    const storedPackage = await ctx.prisma.skillPackage.findUnique({ where: { skillPackageId: skillPackage.skillPackageId } })

    if(storedPackage) {
        // Existing Package
        const existingData = pick(storedPackage, ['name', 'sequence'])
        
        const fields = pick(skillPackage, ['name', 'sequence'])

        const changes = diffObject(existingData, fields)

        if(changes.length > 0) {
            // Only update if one of the fields has changed
            await ctx.prisma.skillPackage.update({ 
                where: { skillPackageId: skillPackage.skillPackageId }, 
                data: {
                    ...fields,
                    changeLogs: {
                        create: {
                            event: 'Update',
                            userId: ctx.auth.userId,
                            timestamp: new Date(),
                            description: "Imported skill package"
                        }
                    }
                }
            })
            changeCounts.skillPackages.update++
        }
    } else {
        // New Package
        const fields = pick(skillPackage, ['skillPackageId', 'name', 'sequence'])

        const changes = diffObject({ tags: [], properties: {}, status: 'Active' }, fields)

        await ctx.prisma.skillPackage.create({ 
            data: {
                ...fields,
                ownerOrgId: ctx.auth.activeOrg.orgId,
                changeLogs: {
                    create: {
                        event: 'Create',
                        userId: ctx.auth.userId,
                        timestamp: new Date(),
                        description: "Import skill package"
                    }
                }
            }
        })
        changeCounts.skillPackages.create++
    }

    // Groups that currently exist in the database
    const storedGroups = await ctx.prisma.skillGroup.findMany({ where: { skillPackageId: skillPackage.skillPackageId } })

    // Groups that are in the imported package
    const groupsToImport = skillPackage.skillGroups

    // Skill Groups that are in the sample set but not in the stored set
    const groupsToAdd = pipe(
        groupsToImport, 
        differenceWith(storedGroups, (a, b) => a.skillGroupId == b.skillGroupId),
        map(omit(['skills', 'subGroups']))
    )

    if(groupsToAdd.length > 0) {
        const timestamp = new Date()
        await ctx.prisma.$transaction([
            ctx.prisma.skillGroup.createMany({ 
                data: groupsToAdd.map(group => ({
                    ...group,
                    skillPackageId: skillPackage.skillPackageId
                }))
            }),
            ctx.prisma.skillPackageChangeLog.createMany({ 
                data: groupsToAdd.map(group => ({
                    event: 'CreateGroup',
                    userId: ctx.auth.userId,
                    skillPackageId: group.skillPackageId,
                    timestamp,
                    meta: { skillGroupId: group.skillGroupId },
                    changes: [],
                    description: "Import skill package"
                }))
            })
        ])
        changeCounts.skillGroups.create = groupsToAdd.length
    }

    // Skill Groups that could need updating
    for(const group of groupsToImport) {
        const storedGroup = storedGroups.find(c => c.skillGroupId == group.skillGroupId)
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
                    where: { skillGroupId: group.skillGroupId },
                    data: changes
                }),
                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        event: 'UpdateGroup',
                        userId: ctx.auth.userId,
                        skillPackageId: group.skillPackageId,
                        timestamp: new Date(),
                        meta: { skillGroupId: group.skillGroupId },
                        description: "Imported skill package"
                    }
                })
            ])
            changeCounts.skillGroups.update++
        }
    }

    // Skills that currently exist in the database
    const storedSkills = await ctx.prisma.skill.findMany({ where: { skillPackageId: skillPackage.skillPackageId }})

    // Skills that are in the imported package
    const skillsToImport = pipe(skillPackage.skillGroups, flatMap(group => group.skills))

    // Skills that are in the sample set but not in the stored set
    const skillsToAdd = pipe(
        skillsToImport, 
        differenceWith(storedSkills, (a, b) => a.skillId == b.skillId),
    )

    if(skillsToAdd.length > 0) {
        const timestamp = new Date()
        await ctx.prisma.$transaction([
            ctx.prisma.skill.createMany({
                data: skillsToAdd.map(skill => ({
                    ...pick(skill, ['skillId', 'skillGroupId', 'name', 'description', 'sequence']),
                    skillPackageId: skillPackage.skillPackageId
                }))
            }),
            ctx.prisma.skillPackageChangeLog.createMany({ 
                data: skillsToAdd.map(skill => ({
                    event: 'CreateSkill',
                    userId: ctx.auth.userId,
                    skillPackageId: skillPackage.skillPackageId,
                    meta: { skillId: skill.skillId },
                    timestamp,
                    description: "Import skill package"
                }))
            })
        ])
        
        changeCounts.skills.create += skillsToAdd.length
    }

    // Skills that could need updating
    for(const skill of skillsToImport) {
        const storedSkill = storedSkills.find(c => c.skillId == skill.skillId)
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
                    where: { skillId: skill.skillId },
                    data: changes
                }),
                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        event: 'UpdateSkill',
                        userId: ctx.auth.userId,
                        skillPackageId: skillPackage.skillPackageId,
                        timestamp: new Date(),
                        meta: { skillId: skill.skillId },
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
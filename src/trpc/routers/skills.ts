/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { Skill as SkillRecord, SkillGroup as SkillGroupRecord, SkillPackage as SkillPackageRecord } from '@prisma/client'

import { skillSchema } from '@/lib/schemas/skill'
import { nanoId16 } from '@/lib/id'
import { zodNanoId8, zodRecordStatus } from '@/lib/validation'
import { TRPCError } from '@trpc/server'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, systemAdminProcedure } from '../init'
import { skillGroupSchema } from '@/lib/schemas/skill-group'
import { skillPackageSchema } from '@/lib/schemas/skill-package'


export const skillsRouter = createTRPCRouter({
    all: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus
        }))
        .output(z.array(skillSchema))
        .query(async ({ ctx, input }) => {
            const skills = await ctx.prisma.skill.findMany({ 
                where: { status: { in: input.status } },
                orderBy: { sequence: 'asc' },
            })
            return skills.map(skill => ({ skillId: skill.id, ...skill }))
        }),

    byId: authenticatedProcedure
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
                            
    bySkillGroupId: authenticatedProcedure
        .input(z.object({
            skillGroupId: zodNanoId8,
            status: zodRecordStatus
        }))
        .output(z.array(skillSchema))
        .query(async ({ ctx, input }) => {
            const skills = await ctx.prisma.skill.findMany({ 
                where: { skillGroupId: input.skillGroupId, status: { in: input.status } },
                orderBy: { sequence: 'asc' },
            })

            return skills.map(skill => ({ skillId: skill.id, ...skill }))
        }),
    bySkillPackageId: authenticatedProcedure
        .input(z.object({
            skillPackageId: zodNanoId8,
            status: zodRecordStatus
        }))
        .output(z.array(skillSchema.extend({
            skillGroup: skillGroupSchema,
        })))
        .query(async ({ ctx, input }) => {
            const skills = await ctx.prisma.skill.findMany({
                where: { skillPackageId: input.skillPackageId, status: { in: input.status } },
                include: {
                    skillGroup: true,
                },
            })

            return skills.map(({ skillGroup, ...skill }) => ({ skillId: skill.id, ...skill, skillGroup: { skillGroupId: skillGroup.id, ...skillGroup } }))
        }), 

    create: systemAdminProcedure
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
                        actorId: ctx.personId,
                        timestamp: new Date(),
                        fields: { ...fields, skillId },
                    }
                })
            ])

            return { skillId, ...newSkill, skillGroup: { skillGroupId: newSkill.skillGroup.id, ...newSkill.skillGroup }, skillPackage: { skillPackageId: newSkill.skillPackage.id, ...newSkill.skillPackage } }
        }),

    delete: systemAdminProcedure
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
                        actorId: ctx.personId,
                        timestamp: new Date(),
                        fields: { skillId },
                    }
                })
            ])

            return { skillId, ...deletedSkill, skillGroup: { skillGroupId: deletedSkill.skillGroup.id, ...deletedSkill.skillGroup }, skillPackage: { skillPackageId: deletedSkill.skillPackage.id, ...deletedSkill.skillPackage } }
        }),

    sys_update: systemAdminProcedure
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
                        actorId: ctx.personId,
                        timestamp: new Date(),
                        fields: { ...changedFields, skillId },
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
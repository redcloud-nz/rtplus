/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { Skill } from '@prisma/client'

import { skillFormSchema } from '@/lib/forms/skill'
import { nanoId16 } from '@/lib/id'
import { zodNanoId8, zodRecordStatus } from '@/lib/validation'
import { TRPCError } from '@trpc/server'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, systemAdminProcedure } from '../init'
import { SkillWithPackageAndGroup } from '../types'


export const skillsRouter = createTRPCRouter({
    all: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus
        }))
        .query(async ({ ctx, input }): Promise<Skill[]> => {
            return ctx.prisma.skill.findMany({ 
                where: { status: { in: input.status } },
                orderBy: { sequence: 'asc' },
            })
        }),

    byId: authenticatedProcedure
        .input(z.object({
            skillId: zodNanoId8,
        }))
        .query(async ({ ctx, input }): Promise<SkillWithPackageAndGroup> => {
            return getSkillById(ctx, input.skillId)
        }),
                            
    bySkillGroupId: authenticatedProcedure
        .input(z.object({
            skillGroupId: zodNanoId8,
            status: zodRecordStatus
        }))
        .query(async ({ ctx, input }): Promise<Skill[]> => {
            return ctx.prisma.skill.findMany({ 
                where: { skillGroupId: input.skillGroupId, status: { in: input.status } },
                orderBy: { sequence: 'asc' },
            })
        }),

    sys_create: systemAdminProcedure
        .input(skillFormSchema)
        .mutation(async ({ ctx, input: { skillPackageId, skillId, ...input } }): Promise<SkillWithPackageAndGroup> => {
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

            return newSkill
        }),

    sys_delete: systemAdminProcedure
        .input(z.object({
            skillId: zodNanoId8
        }))
        .mutation(async ({ ctx, input: { skillId } }): Promise<SkillWithPackageAndGroup> => {
            const skill = await getSkillById(ctx, skillId)

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

            return deletedSkill
        }),

    sys_update: systemAdminProcedure
        .input(skillFormSchema)
        .mutation(async ({ ctx, input: { skillPackageId, skillId, ...input } }): Promise<SkillWithPackageAndGroup> => {
            const skill = await getSkillById(ctx, skillId)

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

            return updatedSkill
        })
})


export async function getSkillById(ctx: AuthenticatedContext, skillId: string): Promise<SkillWithPackageAndGroup> {
    const skill = await ctx.prisma.skill.findUnique({
        where: { id: skillId },
        include: {
            skillPackage: true,
            skillGroup: true,
        }
    })

    if (!skill) throw new TRPCError({ code: 'NOT_FOUND', message: `Skill(${skillId}) not found`})

    return skill
}
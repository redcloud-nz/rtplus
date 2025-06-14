/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { skillGroupFormSchema } from '@/lib/forms/skill-group'
import { nanoId16 } from '@/lib/id'
import { zodNanoId8, zodRecordStatus } from '@/lib/validation'
import { TRPCError } from '@trpc/server'


import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, systemAdminProcedure } from '../init'
import { SkillGroup, SkillGroupBasic, SkillPackage } from '../types'



export const skillGroupsRouter = createTRPCRouter({
    all: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus
        }))
        .query(async ({ ctx, input }): Promise<SkillGroupBasic[]> => {
            return ctx.prisma.skillGroup.findMany({ 
                where: { status: { in: input.status } },
                orderBy: { sequence: 'asc' },
                include: {
                    _count: {
                        select: { skills: true }
                    }
                }
            })
        }),

    byId: authenticatedProcedure
        .input(z.object({
            skillGroupId: zodNanoId8
        }))
        .query(async ({ ctx, input: { skillGroupId} }): Promise<SkillGroupBasic & { skillPackage: SkillPackage, parent: SkillGroup | null }> => {
            const skillGroup = await ctx.prisma.skillGroup.findUnique({
                where: { id: skillGroupId },
                include: {
                    skillPackage: true,
                    parent: true,
                    _count: {
                        select: { skills: true }
                    }
                }
            })

            if (!skillGroup) throw new TRPCError({ code: 'NOT_FOUND', message: `SkillGroup(${skillGroupId}) not found`})

            return skillGroup
        }),

    sys_create: systemAdminProcedure
        .input(skillGroupFormSchema)
        .mutation(async ({ ctx, input: { skillPackageId, skillGroupId, ...input} }): Promise<SkillGroupBasic> => {
            const aggregations = await ctx.prisma.skillGroup.aggregate({
                where: { skillPackageId },
                _max: { sequence: true }
            })

            const fields = { ...input, sequence: (aggregations._max.sequence ?? 0) + 1 }

            const [newGroup] = await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.create({
                    data: {
                        id: skillGroupId,
                        skillPackageId,
                        ...fields,
                    },
                    include: {
                        _count: {
                            select: { skills: true }
                        }
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        skillPackageId,
                        event: 'CreateGroup',
                        actorId: ctx.auth.userId,
                        timestamp: new Date(),
                        fields: { ...fields, skillGroupId },
                    }
                })
            ])

            return newGroup
        }),

    sys_delete: systemAdminProcedure
        .input(z.object({
            skillGroupId: zodNanoId8
        }))
        .mutation(async ({ ctx, input: { skillGroupId } }): Promise<SkillGroupBasic> => {
            const skillGroup = await getSkillGroupById(ctx, skillGroupId)

            if (skillGroup._count.skills > 0) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: `SkillGroup(${skillGroupId}) cannot be deleted because it has associated skills.`})
            }

            const [deletedGroup] = await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.delete({
                    where: { id: skillGroupId },
                    include: {
                        _count: {
                            select: { skills: true }
                        }
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        skillPackageId: skillGroup.skillPackageId,
                        event: 'DeleteGroup',
                        actorId: ctx.auth.userId,
                        timestamp: new Date(),
                        fields: { skillGroupId },
                    }
                })
            ])

            return deletedGroup
        }),

    sys_update: systemAdminProcedure
        .input(skillGroupFormSchema)
        .mutation(async ({ ctx, input: { skillGroupId, ...input} }): Promise<SkillGroupBasic> => {
            const existing = await getSkillGroupById(ctx, skillGroupId)

            const changedFields = pickBy(input, (value, key) => value != existing[key])

            const [updatedGroup] = await ctx.prisma.$transaction([
                ctx.prisma.skillGroup.update({
                    where: { id: skillGroupId },
                    data: changedFields,
                    include: {
                        _count: {
                            select: { skills: true }
                        }
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        skillPackageId: existing.skillPackageId,
                        event: 'UpdateGroup',
                        actorId: ctx.auth.userId,
                        timestamp: new Date(),
                        fields: { ...changedFields, skillGroupId },
                    }
                })
            ])

            return updatedGroup
        })
})


export async function getSkillGroupById(ctx: AuthenticatedContext, skillGroupId: string): Promise<SkillGroupBasic> {
    const skillGroup = await ctx.prisma.skillGroup.findUnique({
        where: { id: skillGroupId },
        include: {
            _count: {
                select: { skills: true }
            }
        }
    })

    if (!skillGroup) throw new TRPCError({ code: 'NOT_FOUND', message: `SkillGroup(${skillGroupId}) not found`})

    return skillGroup
}
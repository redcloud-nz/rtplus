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
import { SkillGroup, SkillGroupWithPackage } from '../types'



export const skillGroupsRouter = createTRPCRouter({
    all: authenticatedProcedure
        .input(z.object({
            status: zodRecordStatus
        }))
        .query(async ({ ctx, input }): Promise<SkillGroup[]> => {
            return ctx.prisma.skillGroup.findMany({ 
                where: { status: { in: input.status } },
                orderBy: { sequence: 'asc' },
            })
        }),

    byId: authenticatedProcedure
        .input(z.object({
            skillGroupId: zodNanoId8
        }))
        .query(async ({ ctx, input: { skillGroupId} }): Promise<SkillGroupWithPackage> => {
            return getSkillGroupById(ctx, skillGroupId)
        }),

    bySkillPackageId: authenticatedProcedure
        .input(z.object({
            skillPackageId: zodNanoId8,
            status: zodRecordStatus
        }))
        .query(async ({ ctx, input: { skillPackageId, status } }): Promise<SkillGroup[]> => {
            return ctx.prisma.skillGroup.findMany({
                where: { skillPackageId, status: { in: status } },
                orderBy: { sequence: 'asc' },
            })
        }),

    sys_create: systemAdminProcedure
        .input(skillGroupFormSchema)
        .mutation(async ({ ctx, input: { skillPackageId, skillGroupId, ...input} }): Promise<SkillGroupWithPackage> => {
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
                        skillPackage: true,
                        parent: true,
                    }
                }),

                ctx.prisma.skillPackageChangeLog.create({
                    data: {
                        id: nanoId16(),
                        skillPackageId,
                        event: 'CreateGroup',
                        actorId: ctx.personId,
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
        .mutation(async ({ ctx, input: { skillGroupId } }): Promise<SkillGroupWithPackage> => {
            const skillGroup = await getSkillGroupById(ctx, skillGroupId)

            const [deletedGroup] = await ctx.prisma.$transaction([
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
                        actorId: ctx.personId,
                        timestamp: new Date(),
                        fields: { skillGroupId },
                    }
                })
            ])

            return deletedGroup
        }),

    sys_update: systemAdminProcedure
        .input(skillGroupFormSchema)
        .mutation(async ({ ctx, input: { skillGroupId, ...input} }): Promise<SkillGroupWithPackage> => {
            const existing = await getSkillGroupById(ctx, skillGroupId)

            const changedFields = pickBy(input, (value, key) => value != existing[key])

            const [updatedGroup] = await ctx.prisma.$transaction([
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
                        actorId: ctx.personId,
                        timestamp: new Date(),
                        fields: { ...changedFields, skillGroupId },
                    }
                })
            ])

            return updatedGroup
        })
})


export async function getSkillGroupById(ctx: AuthenticatedContext, skillGroupId: string): Promise<SkillGroupWithPackage> {
    const skillGroup = await ctx.prisma.skillGroup.findUnique({
        where: { id: skillGroupId },
        include: {
            skillPackage: true,
            parent: true,
        },
    })

    if (!skillGroup) throw new TRPCError({ code: 'NOT_FOUND', message: `SkillGroup(${skillGroupId}) not found`})

    return skillGroup
}
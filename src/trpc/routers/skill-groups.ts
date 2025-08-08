/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { SkillGroup as SkillGroupRecord, SkillPackage as SkillPackageRecord } from '@prisma/client'

import { skillGroupSchema } from '@/lib/schemas/skill-group'
import { skillPackageSchema } from '@/lib/schemas/skill-package'
import { nanoId16 } from '@/lib/id'
import { zodNanoId8, zodRecordStatus } from '@/lib/validation'
import { TRPCError } from '@trpc/server'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter, systemAdminProcedure } from '../init'




export const skillGroupsRouter = createTRPCRouter({

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
                        actorId: ctx.personId,
                        timestamp: new Date(),
                        fields: { ...fields, skillGroupId },
                    }
                })
            ])

            return { skillGroupId, ...created }
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
                        actorId: ctx.personId,
                        timestamp: new Date(),
                        fields: { skillGroupId },
                    }
                })
            ])

            return { skillGroupId, ...deleted }
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
                        actorId: ctx.personId,
                        timestamp: new Date(),
                        fields: { ...changedFields, skillGroupId }, 
                    }
                })
            ])

            return { skillGroupId, ...updated }
        })
})


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
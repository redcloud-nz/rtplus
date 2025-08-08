/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { UTCDate } from '@date-fns/utc'


import { toSkillCheckData, skillCheckSchema } from '@/lib/schemas/skill-check'
import { personSchema, toPersonData } from '@/lib/schemas/person'
import { skillSchema, toSkillData } from '@/lib/schemas/skill'
import { createTRPCRouter, teamAdminProcedure, teamProcedure } from '@/trpc/init'
import { zodNanoId8 } from '@/lib/validation'


export const activeTeamSkillChecksRouter = createTRPCRouter({

    /**
     * Create a new skill check independently of a session.
     * This is typically used by team admins to record skill checks without an active session.
     * @param ctx The authenticated context.
     * @param input The skill check data to create.
     * @returns The created skill check data.
     * @throws TRPCError(FORBIDDEN) if the user is not a team admin and no session is provided.
     */
    createIndependentSkillCheck: teamAdminProcedure
        .input(skillCheckSchema.omit({ assessorId: true, sessionId: true, timestamp: true }))
        .output(skillCheckSchema)
        .mutation(async ({ ctx, input }) => {

            const timestamp = new UTCDate()
            const assessorId = ctx.personId

            const created = await ctx.prisma.skillCheck.create({
                data: {
                    id: input.skillCheckId,
                    result: input.result,
                    notes: input.notes,
                    timestamp,
                    
                    skill: { connect: { id: input.skillId } },
                    assessee: { connect: { id: input.assesseeId } },
                    assessor: { connect: { id: assessorId } },
                }
            })

            return toSkillCheckData(created)
        }),

    getSkillChecks: teamProcedure
        .input(z.object({
            assesseeIds: z.array(zodNanoId8).optional(),
            assessorIds: z.array(zodNanoId8).optional(),
            skillIds: z.array(zodNanoId8).optional(),
        }))
        .output(z.array(skillCheckSchema.extend({ assessee: personSchema, assessor: personSchema, skill: skillSchema })))
        .query(async ({ ctx, input }) => {
            
            const teamMemberIds = (await ctx.prisma.team.findUnique({
                    where: { clerkOrgId: ctx.orgId },
                    select: {
                        teamMemberships: {
                            select: {
                                personId: true
                            }
                        }
                    }
                }))?.teamMemberships.map(m => m.personId) ?? []

            const assesseeIds = input.assesseeIds ? input.assesseeIds.filter(id => teamMemberIds.includes(id)) : teamMemberIds

            const checks = await ctx.prisma.skillCheck.findMany({
                where: {
                    assessee: { id: { in: assesseeIds } },
                    assessor: { id: input.assessorIds ? { in: input.assessorIds } : undefined },
                    skill: { id: input.skillIds ? { in: input.skillIds } : undefined }
                },
                include: {
                    assessee: true,
                    assessor: true,
                    skill: true
                },
                orderBy: {
                    timestamp: 'desc'
                }
            })

            return checks.map(check => ({
                ...toSkillCheckData(check),
                assessee: toPersonData(check.assessee),
                assessor: toPersonData(check.assessor),
                skill: toSkillData(check.skill)
            }))
        })

})

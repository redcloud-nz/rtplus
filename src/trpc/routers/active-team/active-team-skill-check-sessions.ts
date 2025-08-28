/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { SkillCheckSession as SkillCheckSessionRecord, Team as TeamRecord } from '@prisma/client'

import { nanoId16 } from '@/lib/id'
import { toSkillCheckSessionData, skillCheckSessionSchema } from '@/lib/schemas/skill-check-session'
import { zodNanoId8 } from '@/lib/validation'
import { AuthenticatedTeamContext, createTRPCRouter, teamAdminProcedure, teamProcedure } from '@/trpc/init'



export const activeTeamSkillCheckSessionsRouter = createTRPCRouter({

    /**
     * Create a new skill check session in the active team.
     * @param ctx The authenticated team context.
     * @param input The input containing the session data.
     * @returns The created skill check session data.
     * @throws TRPCError(BAD_REQUEST) if the session ID is not provided or if the session already exists.
     */
    createSession: teamAdminProcedure
        .input(skillCheckSessionSchema.pick({ sessionId: true, name: true, date: true }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, ...data } }) => {
            const existingSession = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: sessionId }
            })
            if( existingSession ) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: `Session with ID ${sessionId} already exists.` })
            }

            const session = await ctx.prisma.skillCheckSession.create({
                data: {
                    id: sessionId,
                    ...data,
                    team: { connect: { clerkOrgId: ctx.auth.activeTeam.orgId } },

                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'Create',
                            actorId: ctx.auth.personId,
                            fields: data

                        },
                    },
                },
                include: {
                    _count: {
                        select: { skills: true, assessees: true, assessors: true, checks: true }
                    },
                    team: true
                }
            })
            return toSkillCheckSessionData(session)
        }),

    /**
     * Delete a skill check session from the active team.
     * @param ctx The authenticated team context.
     * @param input The input containing the session ID to delete.
     * @returns The deleted skill check session data.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist in the active team.
     */
    deleteSession: teamAdminProcedure
        .input(z.object({
            sessionId: zodNanoId8
        }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input }) => {
            await getSessionById(ctx, input.sessionId)

            const deleted = await ctx.prisma.skillCheckSession.delete({
                where: { id: input.sessionId },
                include: {
                    _count: {
                        select: { skills: true, assessees: true, assessors: true, checks: true }
                    },
                    team: true
                }
            })
            return toSkillCheckSessionData(deleted)
        }),

    /**
     * Fetch all skill check sessions in the active team.
     * @param ctx The authenticated team context.
     * @returns An array of skill check session data with counts of related entities.
     */
    getTeamSessions: teamProcedure
        .output(z.array(skillCheckSessionSchema))
        .query(async ({ ctx }) => {

            const team = await ctx.prisma.team.findUnique({
                where: { clerkOrgId: ctx.auth.activeTeam.orgId },
                include: {
                    skillCheckSessions: {
                        include: {
                            _count: {
                                select: { skills: true, assessees: true, assessors: true, checks: true }
                            },
                            team: true
                        }
                    }
                }
            })
            if(!team) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Team with slug ${ctx.auth.activeTeam.slug} not found.` })
            }
            return team.skillCheckSessions.map(toSkillCheckSessionData)
        }),

    /**
     * Fetch a skill check session by its ID in the active team.
     * @param ctx The authenticated team context.
     * @param input The input containing the session ID.
     * @returns The skill check session data if found.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist in the active team.
     */ 
    getSession: teamProcedure
        .input(z.object({
            sessionId: zodNanoId8
        }))
        .output(skillCheckSessionSchema)
        .query(async ({ ctx, input }) => {
            const session = await getSessionById(ctx, input.sessionId)
            return toSkillCheckSessionData(session)
        }),

    /**
     * Update an existing skill check session in the active team.
     * @param ctx The authenticated team context.
     * @param input The input containing the session ID and updated data.
     * @returns The updated skill check session data.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist in the active team.
     */
    updateSession: teamAdminProcedure
        .input(skillCheckSessionSchema.pick({ sessionId: true, name: true, date: true }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, ...update } }) => {
            const session = await getSessionById(ctx, sessionId)

            // Pick only the fields that have changed
            const changedFields = pickBy(update, (value, key) => value != session[key])

            const updatedSession = await ctx.prisma.skillCheckSession.update({
                where: { id: session.id },
                data: {
                    ...update,
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'Update',
                            actorId: ctx.auth.personId,
                            fields: changedFields
                        },
                    },
                },
                include: {
                    _count: {
                        select: { skills: true, assessees: true, assessors: true, checks: true }
                    },
                    team: true
                }
            })
            return toSkillCheckSessionData(updatedSession)
        }),

    /**
     * Update the status of a skill check session in the active team.
     * @param ctx The authenticated team context.
     * @param input The input containing the session ID and new status.
     * @returns The updated skill check session data.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist in the active team.
     */
    updateSessionStatus: teamAdminProcedure
        .input(skillCheckSessionSchema.pick({ sessionId: true, sessionStatus: true }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input }) => {
            const session = await getSessionById(ctx, input.sessionId)

            const updatedSession = await ctx.prisma.skillCheckSession.update({
                where: { id: session.id },
                data: {
                    sessionStatus: input.sessionStatus,
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: input.sessionStatus,
                            actorId: ctx.auth.personId,
                            fields: { sessionStatus: input.sessionStatus }
                        },
                    },
                },
                include: {
                    _count: {
                        select: { skills: true, assessees: true, assessors: true, checks: true }
                    },
                    team: true
                }
            })
            return toSkillCheckSessionData(updatedSession)
        })

})

/**
 * Get a skill check session by its ID.
 * @param ctx The authenticated team context.
 * @param sessionId The ID of the session to retrieve.
 * @returns The skill check session record.
 * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist in the active team.
 */
async function getSessionById(ctx: AuthenticatedTeamContext, sessionId: string): Promise<SkillCheckSessionRecord & { _count: { skills: number, assessees: number, assessors: number, checks: number }, team: TeamRecord }> {
    const team = await ctx.prisma.team.findUnique({
        where: { slug: ctx.auth.activeTeam?.slug},
        include: {
            skillCheckSessions: {
                where: { id: sessionId },
                include: {
                    _count: {
                        select: { skills: true, assessees: true, assessors: true, checks: true }
                    },
                    team: true
                }
            }
        }
    })
    const session = team?.skillCheckSessions[0]
    if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `Session with ID ${sessionId} not found.` })
    }
    return session
}

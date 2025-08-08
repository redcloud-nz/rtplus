/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { UTCDate } from '@date-fns/utc'
import { TRPCError } from '@trpc/server'

import { toSkillCheckSessionData, skillCheckSessionSchema } from '@/lib/schemas/skill-check-session'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter } from '../init'
import { zodNanoId16, zodNanoId8 } from '@/lib/validation'
import { toPersonData, personSchema } from '@/lib/schemas/person'
import { nanoId16 } from '@/lib/id'
import { toSkillData, skillSchema } from '@/lib/schemas/skill'
import { toSkillCheckData, skillCheckSchema } from '@/lib/schemas/skill-check'




export const skillCheckSessionsRouter = createTRPCRouter({

    /**
     * Add an assessee to a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and assessee ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    addAssessee: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8,
            assesseeId: zodNanoId8
        }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, assesseeId } }) => {
            await checkAccessToSession(ctx, sessionId)

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { id: sessionId },
                data: {
                    assessees: {
                        connect: { id: assesseeId }
                    },
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'AddAssessee',
                            actorId: ctx.personId,
                            meta: { assesseeId }
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    }
                }
            })

            return toSkillCheckSessionData(updated)
    }),

    /**
     * Add an assessor to a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and assessor ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    addAssessor: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8,
            assessorId: zodNanoId8
        }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, assessorId } }) => {
            await checkAccessToSession(ctx, sessionId)

            
            const updated = await ctx.prisma.skillCheckSession.update({
                where: { id: sessionId },
                data: {
                    assessors: {
                        connect: { id: assessorId }
                    },
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'AddAssessor',
                            actorId: ctx.personId,
                            meta: { assessorId }
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    }
                }
            })

            return toSkillCheckSessionData(updated)
    }),

    /**
     * Add a skill to a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and skill ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    addSkill: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8,
            skillId: zodNanoId8
        }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, skillId } }) => {
            await checkAccessToSession(ctx, sessionId)

            
            const updated = await ctx.prisma.skillCheckSession.update({
                where: { id: sessionId },
                data: {
                    skills: {
                        connect: { id: skillId }
                    },
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'AddSkill',
                            actorId: ctx.personId,
                            meta: { skillId }
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    }
                }
            })

            return toSkillCheckSessionData(updated)
    }),


    /**
     * Create a new skill check within a skill check session.
     * @param ctx The authenticated context.
     * @param input The skill check data to create.
     * @returns The created skill check data.
     * @throws TRPCError(FORBIDDEN) if the user is not a team admin and no session is provided.
     */
    createCheck: authenticatedProcedure
        .input(skillCheckSchema.omit({ assessorId: true, timestamp: true }).extend({ sessionId: zodNanoId8 }))
        .output(skillCheckSchema)
        .mutation(async ({ ctx, input }) => {

            const timestamp = new UTCDate()
            const assessorId = ctx.personId

            // Ensure the user has access to the session
            await checkAccessToSession(ctx, input.sessionId)

            const { checks: [created] } = await ctx.prisma.skillCheckSession.update({
                where: { id: input.sessionId },
                data: {
                    checks: {
                        create: {
                            id: input.skillCheckId,
                            result: input.result,
                            notes: input.notes,
                            timestamp,
                            skill: { connect: { id: input.skillId } },
                            assessee: { connect: { id: input.assesseeId } },
                            assessor: { connect: { id: assessorId } },
                        }
                    },
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'CreateCheck',
                            actorId: ctx.personId,
                            timestamp,
                            meta: {
                                skillCheckId: input.skillCheckId,
                                skillId: input.skillId,
                                assesseeId: input.assesseeId,
                                assessorId: assessorId,
                            },
                            fields: {
                                result: input.result,
                                notes: input.notes,
                                timestamp,
                            }
                        }
                    }
                },
                include: {
                    checks: {
                        where: { id: input.skillCheckId },
                    }
                }
            })
            return toSkillCheckData(created)
        }),

    /**
     * Delete a skill check from a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and skill check ID.
     * @returns The deleted skill check data.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    deleteCheck: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8,
            skillCheckId: zodNanoId16
        }))
        .output(skillCheckSchema)
        .mutation(async ({ ctx, input }) => {
            await checkAccessToSession(ctx, input.sessionId)

            const timestamp = new UTCDate()

            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    checks: {
                        where: { id: input.skillCheckId },
                    }
                }
            })
            const existing = session!.checks[0]

            await ctx.prisma.skillCheckSession.update({
                where: { id: input.sessionId },
                data: {
                    checks: {
                        delete: {
                            id: input.skillCheckId
                        }
                    },
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'DeleteCheck',
                            actorId: ctx.personId,
                            timestamp,
                            meta: {
                                skillCheckId: input.skillCheckId,
                                sessionId: input.sessionId,
                                assesseeId: existing.assesseeId,
                                assessorId: existing.assessorId,
                            },
                        }
                    }
                },
                include: {
                    checks: {
                        where: { id: input.skillCheckId },
                    }
                }
            })
            return toSkillCheckData(existing)
        }),

    /**
     * Get a list of assessees for a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assessees for the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    getAssessee: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8
        }))
        .output(z.array(personSchema))
        .query(async ({ ctx, input }) => {
            await checkAccessToSession(ctx, input.sessionId)

            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    assessees: true,
                }
            })

            return (session?.assessees ?? []).map(toPersonData)
        }),

    /**
     * Get a list of assessors for a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assessors for the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    getAssessors: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8
        }))
        .output(z.array(personSchema))
        .query(async ({ ctx, input }) => {
            await checkAccessToSession(ctx, input.sessionId)

            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    assessors: true,
                }
            })

            return (session?.assessors ?? []).map(toPersonData)
        }),
        
    /**
     * Fetch all skill checks for a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of skill checks for the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    getChecks: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8
        }))
        .output(z.array(skillCheckSchema))
        .query(async ({ ctx, input }) => {
            await checkAccessToSession(ctx, input.sessionId)
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    checks: true,
                }
            })

            return (session?.checks ?? []).map(toSkillCheckData)
        }),

    /**
     * Fetch the skill check sessions that the authenticated user is an assessor for.
     * @param ctx The authenticated context.
     * @returns An array of skill check sessions with counts.
     */
    getMySessions: authenticatedProcedure
        .output(z.array(skillCheckSessionSchema))
        .query(async ({ ctx }) => {
            const sessions = await ctx.prisma.skillCheckSession.findMany({
                where: {
                    assessors: {
                        some: { id: ctx.personId }
                    }
                },
                include: {
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    }
                }
            })

            return sessions.map(toSkillCheckSessionData)
        }),

    getSession: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8
        }))
        .output(skillCheckSessionSchema)
        .query(async ({ ctx, input }) => {
            await checkAccessToSession(ctx, input.sessionId)

            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    }
                }
            })

            if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: `Skill check session with ID '${input.sessionId}' not found` })

            return toSkillCheckSessionData(session)
        }),

    /**
     * Fetch the skills associated with a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of skills for the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    getSkills: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8
        }))
        .output(z.array(skillSchema))
        .query(async ({ ctx, input }) => {
            await checkAccessToSession(ctx, input.sessionId)
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    skills: true,
                }
            })

            return (session?.skills ?? []).map(toSkillData)
        }),


    /**
     * Remove an assessee from a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and assessee ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    removeAssessee: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8,
            assesseeId: zodNanoId8
        }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, assesseeId } }) => {
            await checkAccessToSession(ctx, sessionId)

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { id: sessionId },
                data: {
                    assessees: {
                        disconnect: { id: assesseeId }
                    },
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'RemoveAssessee',
                            actorId: ctx.personId,
                            meta: { assesseeId }
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    }
                }
            })

            return toSkillCheckSessionData(updated)
        }),

    /**
     * Remove an assessor from a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and assessor ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    removeAssessor: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8,
            assessorId: zodNanoId8
        }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, assessorId } }) => {
            await checkAccessToSession(ctx, sessionId)

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { id: sessionId },
                data: {
                    assessors: {
                        disconnect: { id: assessorId }
                    },
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'RemoveAssessor',
                            actorId: ctx.personId,
                            meta: { assessorId }
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    }
                }
            })

            return toSkillCheckSessionData(updated)
        }),

    /**
     * Remove a skill from a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and skill ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    removeSkill: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8,
            skillId: zodNanoId8
        }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, skillId } }) => {
            await checkAccessToSession(ctx, sessionId)

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { id: sessionId },
                data: {
                    skills: {
                        disconnect: { id: skillId }
                    },
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'RemoveSkill',
                            actorId: ctx.personId,
                            meta: { skillId }
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    }
                }
            })

            return toSkillCheckSessionData(updated)
        }),

    /**
     * Update a skill check within a skill check session.
     * This allows updating the result, notes, and timestamp of an existing skill check.
     * @param ctx The authenticated context.
     * @param input The input containing the session data to update.
     * @returns The updated skill check session data.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    updateCheck: authenticatedProcedure
        .input(skillCheckSchema.omit({ assessorId: true, timestamp: true }).extend({ sessionId: zodNanoId8 }))
        .output(skillCheckSchema)
        .mutation(async ({ ctx, input }) => {

            await checkAccessToSession(ctx, input.sessionId)

            const timestamp = new UTCDate()
            const assessorId = ctx.personId

            const { checks: [updated] } = await ctx.prisma.skillCheckSession.update({
                where: { id: input.sessionId },
                data: {
                    checks: {
                        update: {
                            where: { id: input.skillCheckId },
                            data: {
                                result: input.result,
                                notes: input.notes,
                                assessor: { connect: { id: assessorId } },
                                timestamp
                            }
                        }
                    },
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: 'UpdateCheck',
                            actorId: ctx.personId,
                            meta: {
                                skillCheckId: input.skillCheckId,
                                skillId: input.skillId,
                                assesseeId: input.assesseeId,
                                assessorId: assessorId,
                            },
                            fields: {
                                result: input.result,
                                notes: input.notes,
                                timestamp,
                            }
                        }
                    }
                },
                include: {
                    checks: {
                        where: { id: input.skillCheckId },
                    }
                }
            })
            return toSkillCheckData(updated)
        })

})


/**
 * Check if the authenticated user has access to a skill check session.
 * 
 * The user must either be an assessor of the session or an admin of the team that owns the session.
 * @param ctx The authenticated context.
 * @param sessionId The ID of the session to check.
 * @throws TRPCError(NOT_FOUND) if the session is not found or the user does not have access.
 */
export async function checkAccessToSession(ctx: AuthenticatedContext, sessionId: string): Promise<void> {
    const orgIdIfAdmin = (ctx.isCurrentTeamAdmin ? ctx.auth.orgId : "NEVER") ?? "NEVER"

    const session = await ctx.prisma.skillCheckSession.findUnique({
        where: { 
            id: sessionId,
            OR: [
                { assessors: { some: { id: ctx.personId } } }, // Assessor of the session
                { team: { clerkOrgId: orgIdIfAdmin } } // Team of the session if user is a team admin
            ]
        },
    })

    if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: `Session with ID ${sessionId} not found.` })
    
}
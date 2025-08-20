/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { UTCDate } from '@date-fns/utc'
import { TRPCError } from '@trpc/server'

import { Skill as SkillRecord, SkillCheckSession as SkillCheckSessionRecord } from '@prisma/client'

import { nanoId16 } from '@/lib/id'
import { toPersonData, personSchema } from '@/lib/schemas/person'
import { toSkillData, skillSchema } from '@/lib/schemas/skill'
import { toSkillCheckData, skillCheckSchema } from '@/lib/schemas/skill-check'
import { toSkillCheckSessionData, skillCheckSessionSchema } from '@/lib/schemas/skill-check-session'
import { teamSchema, toTeamData } from '@/lib/schemas/team'
import { zodNanoId16, zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter } from '../init'


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
        .output(z.object({
            session: skillCheckSessionSchema,
            assessee: personSchema
        }))
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
                    assessees: {
                        where: { id: assesseeId },
                    },
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
                    team: true
                }
            })

            return {
                session: toSkillCheckSessionData(updated),
                assessee: toPersonData(updated.assessees[0])
            }
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
        .output(z.object({
            session: skillCheckSessionSchema,
            assessor: personSchema
        }))
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
                    assessors: {
                        where: { id: assessorId },
                    },
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
                    team: true
                }
            })

            return {
                session: toSkillCheckSessionData(updated),
                assessor: toPersonData(updated.assessors[0])
            }
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
        .output(z.object({
            session: skillCheckSessionSchema,
            skill: skillSchema
        }))
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
                    },
                    skills: {
                        where: { id: skillId },
                    },
                    team: true
                }
            })

            return {
                session: toSkillCheckSessionData(updated),
                skill: toSkillData(updated.skills[0])
            }
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
        .output(z.object({
            session: skillCheckSessionSchema,
            check: skillCheckSchema
        }))
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

            const updated = await ctx.prisma.skillCheckSession.update({
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
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
                    team: true
                }
            })
            return {
                session: toSkillCheckSessionData(updated),
                check: toSkillCheckData(existing)
            }
        }),

    /**
     * Get a list of assessees for a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assessees for the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    getAssessees: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8
        }))
        .output(z.array(personSchema))
        .query(async ({ ctx, input }) => {
            await checkAccessToSession(ctx, input.sessionId)

            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    assessees: {
                        orderBy: {
                            name: 'asc'
                        }
                    }
                },
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
        .input(z.object({
            status: z.array(z.enum(['Draft', 'Complete', 'Discard'])).optional().default(['Draft'])
        }))
        .output(z.array(skillCheckSessionSchema.extend({ team: teamSchema })))
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
                    },
                    team: true
                }
            })

            return sessions.map(session => ({
                ...toSkillCheckSessionData(session),
                team: toTeamData(session.team)
            }))
        }),

    getSession: authenticatedProcedure
        .input(z.object({
            sessionId: zodNanoId8
        }))
        .output(skillCheckSessionSchema.extend({ team: teamSchema }))
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
                    },
                    team: true
                }
            })

            if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: `Skill check session with ID '${input.sessionId}' not found` })

            return {
                ...toSkillCheckSessionData(session),
                team: toTeamData(session.team)
            }
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
        .output(z.object({
            session: skillCheckSessionSchema,
            assessee: personSchema
        }))
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
                    assessees: {
                        where: { id: assesseeId },
                    },
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
                    team: true
                }
            })

            return {
                session: toSkillCheckSessionData(updated),
                assessee: toPersonData(updated.assessees[0])
            }
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
        .output(z.object({
            session: skillCheckSessionSchema,
            assessor: personSchema
        }))
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
                    assessors: {
                        where: { id: assessorId },
                    },
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
                    team: true
                }
            })

            return {
                session: toSkillCheckSessionData(updated),
                assessor: toPersonData(updated.assessors[0])
            }
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
        .output(z.object({
            session: skillCheckSessionSchema,
            skill: skillSchema
        }))
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
                    },
                    skills: {
                        where: { id: skillId },
                    },
                    team: true
                }
            })

            return {
                session: toSkillCheckSessionData(updated),
                skill: toSkillData(updated.skills[0])
            }
        }),

    /**
     * Save a skill check within a skill check session.
     * @param ctx The authenticated context.
     * @param input The skill check data to create.
     * @returns The created skill check data.
     * @throws TRPCError(FORBIDDEN) if the user is not a team admin and no session is provided.
     */
    saveCheck: authenticatedProcedure
        .input(skillCheckSchema.omit({ assessorId: true, teamId: true, date: true, timestamp: true }).extend({ sessionId: zodNanoId8 }))
        .output(z.object({
            session: skillCheckSessionSchema,
            check: skillCheckSchema,
        }))
        .mutation(async ({ ctx, input }) => {

            const assessorId = ctx.personId

            // Ensure the user has access to the session
            const session = await checkAccessToSession(ctx, input.sessionId)

            const existingCheck = await ctx.prisma.skillCheck.findFirst({
                where: { id: input.skillCheckId, sessionId: input.sessionId },
            })

            const checkId = existingCheck ? input.skillCheckId : nanoId16()

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { id: input.sessionId },
                data: {
                    checks: existingCheck 
                    ? {
                        update: {
                            where: { id: existingCheck.id },
                            data: {
                                result: input.result,
                                notes: input.notes,
                                date: session.date,
                            }
                        }
                    }
                    : {
                        create: {
                            id: checkId,
                            result: input.result,
                            notes: input.notes,
                            date: session.date,
                            skill: { connect: { id: input.skillId } },
                            team: { connect: { id: session.teamId } },
                            assessee: { connect: { id: input.assesseeId } },
                            assessor: { connect: { id: assessorId } },
                        }
                    },
                    changeLogs: {
                        create: {
                            id: nanoId16(),
                            event: existingCheck ? 'UpdateCheck' : 'CreateCheck',
                            actorId: ctx.personId,
                            meta: {
                                skillCheckId: checkId,
                                skillId: input.skillId,
                                assesseeId: input.assesseeId,
                                assessorId: assessorId,
                            },
                            fields: {
                                result: input.result,
                                notes: input.notes,
                            }
                        }
                    }
                },
                include: {
                    checks: {
                        where: { id: checkId },
                    },
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
                    team: true
                }
            })
            return {
                session: toSkillCheckSessionData(updated),
                check: toSkillCheckData(updated.checks[0])
            }
        }),

})


/**
 * Check if the authenticated user has access to a skill check session.
 * 
 * The user must either be an assessor of the session or an admin of the team that owns the session.
 * @param ctx The authenticated context.
 * @param sessionId The ID of the session to check.
 * @throws TRPCError(NOT_FOUND) if the session is not found or the user does not have access.
 */
export async function checkAccessToSession(ctx: AuthenticatedContext, sessionId: string): Promise<SkillCheckSessionRecord> {
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
    
    return session
}

export async function getSkillById(ctx: AuthenticatedContext, skillId: string): Promise<SkillRecord> {
    const skill = await ctx.prisma.skill.findUnique({
        where: { id: skillId }
    })

    if (!skill) throw new TRPCError({ code: 'NOT_FOUND', message: `Skill with ID '${skillId}' not found` })

    return skill
}
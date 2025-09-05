/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { UTCDate } from '@date-fns/utc'
import { TRPCError } from '@trpc/server'

import { Skill as SkillRecord } from '@prisma/client'

import { nanoId16 } from '@/lib/id'
import { toPersonData, personSchema, personRefSchema, toPersonRefData } from '@/lib/schemas/person'
import { toSkillData, skillSchema } from '@/lib/schemas/skill'
import { toSkillCheckData, skillCheckSchema } from '@/lib/schemas/skill-check'
import { toSkillCheckSessionData, skillCheckSessionSchema } from '@/lib/schemas/skill-check-session'
import { teamSchema, toTeamData } from '@/lib/schemas/team'
import { zodNanoId16, zodNanoId8 } from '@/lib/validation'

import { AuthenticatedContext, authenticatedProcedure, createTRPCRouter } from '../init'
import { CompetenceLevel, isPass } from '@/lib/competencies'
import { match } from 'ts-pattern'

const sessionProcedure = authenticatedProcedure
    .input(z.object({ sessionId: zodNanoId8 }))
    .use(async ({ ctx, input, next }) => {
        const session = await ctx.prisma.skillCheckSession.findUnique({
            where: { id: input.sessionId },
            include: {
                assessors: true,
                team: true,
            }
        })

        if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: `Session with ID ${input.sessionId} not found.` })

        if(session.assessors.some(a => a.id === ctx.auth.personId) || ctx.hasTeamAccess(session.team)) {
            // The user has access to this session because they are an assessor or have team access
            return next({
                ctx: {
                    ...ctx,
                    skillCheckSession: session
                }
            })
        }
        else throw new TRPCError({ code: 'FORBIDDEN', message: `User does not have access to session with ID ${input.sessionId}` })
    })

export const skillCheckSessionsRouter = createTRPCRouter({

    /**
     * Add an assessee to a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and assessee ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    addAssessee: sessionProcedure
        .input(z.object({
            assesseeId: zodNanoId8
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            assessee: personSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, assesseeId } }) => {

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
                            actorId: ctx.auth.personId,
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
    addAssessor: sessionProcedure
        .input(z.object({
            assessorId: zodNanoId8
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            assessor: personSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, assessorId } }) => {

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
                            actorId: ctx.auth.personId,
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
    addSkill: sessionProcedure
        .input(z.object({
            sessionId: zodNanoId8,
            skillId: zodNanoId8
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            skill: skillSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, skillId } }) => {

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
                            actorId: ctx.auth.personId,
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
    deleteCheck: sessionProcedure
        .input(z.object({
            sessionId: zodNanoId8,
            skillCheckId: zodNanoId16
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            check: skillCheckSchema
        }))
        .mutation(async ({ ctx, input }) => {

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
                            actorId: ctx.auth.personId,
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
    getAssignedAssessees: sessionProcedure
        .output(z.array(personRefSchema))
        .query(async ({ ctx, input }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    assessees: { 
                        select: { id: true, name: true },
                        orderBy: { name: 'asc' }
                    }
                }
            })

            return (session?.assessees ?? []).map(toPersonRefData)
        }),

    /**
     * Get a list of assessors for a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assessors for the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    getAssignedAssessors: sessionProcedure
        .output(z.array(personRefSchema))
        .query(async ({ ctx, input }) => {
        
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    assessors: { 
                        select: { id: true, name: true },
                        orderBy: { name: 'asc' }
                    }
                }
            })

            return (session?.assessors ?? []).map(toPersonRefData)
        }),

    /**
     * Fetch the skill ids associated with a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assigned skill ids for the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    getAssignedSkillIds: sessionProcedure
        .output(z.array(zodNanoId8))
        .query(async ({ ctx, input }) => {
            
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    skills: {
                        select: { id: true }
                    }
                }
            })
            

            return (session?.skills ?? []).map(s => s.id)
        }),
        
    /**
     * Fetch the skill checks for a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and optionally an assessor ID.
     * @returns An array of skill checks for the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    getChecks: sessionProcedure
        .input(z.object({
            assessorId: z.union([zodNanoId8, z.literal('me')]).optional()
        }))
        .output(z.array(skillCheckSchema))
        .query(async ({ ctx, input }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: {
                    id: input.sessionId,
                    assessors: input.assessorId ? { some: { id: input.assessorId == 'me' ? ctx.auth.personId : input.assessorId } } : undefined
                },
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
                        some: { id: ctx.auth.personId }
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

    getSession: sessionProcedure
        .output(skillCheckSessionSchema.extend({ team: teamSchema }))
        .query(async ({ ctx, input }) => {

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
     * Remove an assessee from a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and assessee ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist or the user does not have access.
     */
    removeAssessee: sessionProcedure
        .input(z.object({
            assesseeId: zodNanoId8
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            assessee: personSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, assesseeId } }) => {

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
                            actorId: ctx.auth.personId,
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
    removeAssessor: sessionProcedure
        .input(z.object({
            assessorId: zodNanoId8
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            assessor: personSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, assessorId } }) => {

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
                            actorId: ctx.auth.personId,
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
    removeSkill: sessionProcedure
        .input(z.object({
            skillId: zodNanoId8
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            skill: skillSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, skillId } }) => {

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
                            actorId: ctx.auth.personId,
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
     * @param input The skill check data to save.
     * @returns The created skill check data.
     * @throws TRPCError(FORBIDDEN) if the user is not a team admin and no session is provided.
     */
    saveCheck: sessionProcedure
        .input(skillCheckSchema.pick({ skillCheckId: true, skillId: true, assesseeId: true, result: true, notes: true }).extend({ sessionId: zodNanoId8 }))
        .output(z.object({
            check: skillCheckSchema,
        }))
        .mutation(async ({ ctx, input }) => {

            const assessorId = ctx.auth.personId
            const session = ctx.skillCheckSession

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { id: input.sessionId },
                data: {
                    checks: {
                        upsert: {
                            where: { id: input.skillCheckId },
                            create: {
                                id: input.skillCheckId,
                                passed: isPass(input.result as CompetenceLevel),
                                result: input.result,
                                notes: input.notes,
                                date: session.date,
                                checkStatus: 'Draft',
                                skill: { connect: { id: input.skillId } },
                                team: { connect: { id: session.teamId } },
                                assessee: { connect: { id: input.assesseeId } },
                                assessor: { connect: { id: assessorId } },
                                
                            },
                            update: {
                                result: input.result,
                                notes: input.notes,
                                date: session.date,
                            }
                        }
                    },
                },
                include: {
                    checks: {
                        where: { id: input.skillCheckId },
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

    /** 
     * Save one or more skills checks within a session.
     * @param ctx The authenticated context.
     * @param input The skill check data
     * 
     */
    saveChecks: sessionProcedure
        .input(z.object({
            sessionId: zodNanoId8,
            checks: z.array(skillCheckSchema.pick({ skillCheckId: true, skillId: true, assesseeId: true, result: true, notes: true }))
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            checks: z.array(skillCheckSchema)
        }))
        .mutation(async ({ ctx, input }) => {
            const assessorId = ctx.auth.personId
            const session = ctx.skillCheckSession

            const upsertedChecks = await Promise.all(input.checks.map(async inputCheck => ctx.prisma.skillCheck.upsert({
                    where: { id: inputCheck.skillCheckId },
                    create: {
                        id: inputCheck.skillCheckId,
                        passed: isPass(inputCheck.result as CompetenceLevel),
                        result: inputCheck.result,
                        notes: inputCheck.notes,
                        date: session.date,
                        checkStatus: 'Draft',
                        skill: { connect: { id: inputCheck.skillId } },
                        session: { connect: { id: input.sessionId } },
                        team: { connect: { id: session.teamId } },
                        assessee: { connect: { id: inputCheck.assesseeId } },
                        assessor: { connect: { id: assessorId } },
                    },
                    update: {
                        result: inputCheck.result,
                        notes: inputCheck.notes,
                    }
                })
            ))

            const updatedSession = await ctx.prisma.skillCheckSession.findUnique({
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

            return {
                session: toSkillCheckSessionData(updatedSession!),
                checks: upsertedChecks.map(toSkillCheckData)
            }
        }),

    /**
     * Update the assessees assigned to the session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID, additions, and removals.
     * @param input.sessionId The ID of the skill check session to update.
     * @param input.additions An array of assessee IDs to add to the session.
     * @param input.removals An array of assessee IDs to remove from the session.
     * @throws TRPCError(NOT_FOUND) if the session is not found.
     * @throws TRPCError(FORBIDDEN) If the user does not have access to the session
     */
    updateAssessees: sessionProcedure
        .input(z.object({
            additions: z.array(zodNanoId8),
            removals: z.array(zodNanoId8)
        }))
        .output(z.object({
            addCount: z.number(),
            removeCount: z.number(),
        }))
        .mutation(async ({ ctx, input: { sessionId, additions, removals } }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: sessionId },
                include: { assessees: { select: { id: true }} }
            })
            const assignedAssesseeIds = (session?.assessees ?? []).map(s => s.id)
            
            // Filter out any additions that are already set in the database
            additions = additions.filter(idToAdd => !assignedAssesseeIds.includes(idToAdd))

            // Filter out any removals that are not currently set in the database
            removals = removals.filter(idToRemove => assignedAssesseeIds.includes(idToRemove))

            await ctx.prisma.skillCheckSession.update({
                where: { id: sessionId },
                data: {
                    assessees: {
                        connect:  additions.map(id => ({ id })),
                       
                        disconnect: removals.map(id => ({ id }))
                    },
                    changeLogs: {
                        create: [
                            ...additions.map(assesseeId => ({
                                id: nanoId16(),
                                event: 'AddAssessee',
                                actorId: ctx.auth.personId,
                                meta: { assesseeId }
                            } as const)),
                            ...removals.map(assesseeId => ({
                                id: nanoId16(),
                                event: 'RemoveAssessee',
                                actorId: ctx.auth.personId,
                                meta: { assesseeId }
                            } as const))
                        ]
                    }
                }
            })

            return {
                addCount: additions.length,
                removeCount: removals.length
            }
        }),

    /**
     * Update the assessors assigned to the session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID, additions, and removals.
     * @param input.sessionId The ID of the skill check session to update.
     * @param input.additions An array of assessor IDs to add to the session.
     * @param input.removals An array of assessor IDs to remove from the session.
     * @throws TRPCError(NOT_FOUND) if the session is not found.
     * @throws TRPCError(FORBIDDEN) If the user does not have access to the session.
     */
    updateAssessors: sessionProcedure
        .input(z.object({
            additions: z.array(zodNanoId8),
            removals: z.array(zodNanoId8)
        }))
        .output(z.object({
            addCount: z.number(),
            removeCount: z.number(),
        }))
        .mutation(async ({ ctx, input: { sessionId, additions, removals } }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: sessionId },
                include: { assessors: { select: { id: true }} }
            })

             const assignedAssessorIds = (session?.assessors ?? []).map(s => s.id)

            // Filter out any additions that are already set in the database
            additions = additions.filter(idToAdd => !assignedAssessorIds.includes(idToAdd))

            // Filter out any removals that are not currently set in the database
            removals = removals.filter(idToRemove => assignedAssessorIds.includes(idToRemove))

            await ctx.prisma.skillCheckSession.update({
                where: { id: sessionId },
                data: {
                    assessors: {
                        connect: additions.map(id => ({ id })),
                        disconnect: removals.map(id => ({ id }))
                    },
                    changeLogs: {
                        create: [
                            ...additions.map(assessorId => ({
                                id: nanoId16(),
                                event: 'AddAssessor',
                                actorId: ctx.auth.personId,
                                meta: { assessorId }
                            } as const)),
                            ...removals.map(assessorId => ({
                                id: nanoId16(),
                                event: 'RemoveAssessor',
                                actorId: ctx.auth.personId,
                                meta: { assesseeId: assessorId }
                            } as const))
                        ]
                    }
                }
            })

            return {
                addCount: additions.length,
                removeCount: removals.length
            }
        }),

    /**
     * Update the skills assigned to the session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID, additions, and removals.
     * @param input.sessionId The ID of the skill check session to update.
     * @param input.additions An array of skill IDs to add to the session.
     * @param input.removals An array of skill IDs to remove from the session.
     * @throws TRPCError(NOT_FOUND) if the session is not found.
     * @throws TRPCError(FORBIDDEN) If the user does not have access to the session
     */
    updateSkills: sessionProcedure
        .input(z.object({
            additions: z.array(zodNanoId8),
            removals: z.array(zodNanoId8)
        }))
        .output(z.object({
            addCount: z.number(),
            removeCount: z.number(),
        }))
        .mutation(async ({ ctx, input: { sessionId, additions, removals } }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: sessionId },
                include: { skills: { select: { id: true }} }
            })

            const assignedSkillIds = (session?.skills ?? []).map(s => s.id)
           

            // Filter out any additions that are already set in the database
            additions = additions.filter(idToAdd => !assignedSkillIds.includes(idToAdd))

            // Filter out any removals that are not currently set in the database
            removals = removals.filter(idToRemove => assignedSkillIds.includes(idToRemove))

            await ctx.prisma.skillCheckSession.update({
                where: { id: sessionId },
                data: {
                    skills: {
                        connect: additions.map(id => ({ id })),
                        disconnect: removals.map(id => ({ id }))
                    },
                    changeLogs: {
                        create: [
                            ...additions.map(skillId => ({
                                id: nanoId16(),
                                event: 'AddSkill',
                                actorId: ctx.auth.personId,
                                meta: { skillId }
                            } as const)),
                            ...removals.map(skillId => ({
                                id: nanoId16(),
                                event: 'RemoveSkill',
                                actorId: ctx.auth.personId,
                                meta: { skillId }
                            } as const))
                        ]
                    }
                }
            })

            return {
                addCount: additions.length,
                removeCount: removals.length
            }
        }),

})



export async function getSkillById(ctx: AuthenticatedContext, skillId: string): Promise<SkillRecord> {
    const skill = await ctx.prisma.skill.findUnique({
        where: { id: skillId }
    })

    if (!skill) throw new TRPCError({ code: 'NOT_FOUND', message: `Skill with ID '${skillId}' not found` })

    return skill
}
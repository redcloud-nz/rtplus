/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pickBy } from 'remeda'
import { z } from 'zod'

import { UTCDate } from '@date-fns/utc'
import { TRPCError } from '@trpc/server'

import { CompetenceLevel, isPass } from '@/lib/competencies'
import { nanoId16 } from '@/lib/id'
import { toPersonData, personSchema, personRefSchema, toPersonRef, PersonId } from '@/lib/schemas/person'
import { toSkillData, skillSchema } from '@/lib/schemas/skill'
import { toSkillCheckData, skillCheckSchema } from '@/lib/schemas/skill-check'
import { toSkillCheckSessionData, skillCheckSessionSchema } from '@/lib/schemas/skill-check-session'
import { teamSchema, toTeamData } from '@/lib/schemas/team'
import { zodNanoId16, zodNanoId8 } from '@/lib/validation'
import { fetchTeamByIdCached } from '@/server/data/team'

import { authenticatedProcedure, createTRPCRouter, teamAdminProcedure, teamProcedure } from '../init'
import { Messages } from '../messages'


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

        if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(input.sessionId) })

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

export const skillChecksRouter = createTRPCRouter({

    /**
     * Add an assessee to a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and assessee ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    addSessionAssessee: sessionProcedure
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
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    addSessionAssessor: sessionProcedure
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
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    addSessionSkill: sessionProcedure
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
     * Create a new skill check independently of a session.
     * This is typically used by team admins to record skill checks without an active session.
     * @param ctx The authenticated context.
     * @param input The skill check data to create.
     * @returns The created skill check data.
     */
    createIndependentSkillCheck: teamProcedure
        .input(skillCheckSchema.pick({ skillCheckId: true, skillId: true, assesseeId: true, result: true, notes: true, date: true }))
        .output(skillCheckSchema)
        .mutation(async ({ ctx, input }) => {

            const assessorId = ctx.auth.personId

            const created = await ctx.prisma.skillCheck.create({
                data: {
                    id: input.skillCheckId,
                    passed: isPass(input.result as CompetenceLevel),
                    result: input.result,
                    notes: input.notes,
                    date: input.date,
                    checkStatus: 'Complete',
                    team: { connect: { id: input.teamId } },

                    skill: { connect: { id: input.skillId } },
                    assessee: { connect: { id: input.assesseeId } },
                    assessor: { connect: { id: assessorId } },
                }
            })

            return toSkillCheckData(created)
        }),

    /**
     * Create a new skill check session for the specified team.
     * @param ctx The authenticated team context.
     * @param input The input containing the session data.
     * @returns The created skill check session data.
     * @throws TRPCError(BAD_REQUEST) if the session ID is not provided or if the session already exists.
     */
    createSession: teamAdminProcedure
        .input(skillCheckSessionSchema.pick({ sessionId: true, name: true, date: true }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, teamId, ...data } }) => {
            const team = await fetchTeamByIdCached(teamId)
            if(!team || !ctx.hasTeamAdmin(team)) throw new TRPCError({ code: 'FORBIDDEN', message: Messages.teamForbidden(teamId) })

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
                    team: { connect: { id: teamId } },

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
     * Delete a skill check session belonging to the specified team.
     * @param ctx The authenticated team context.
     * @param input The input containing the session ID to delete.
     * @returns The deleted skill check session data.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist in the active team.
     */
    deleteSession: teamAdminProcedure
        .input(z.object({ sessionId: zodNanoId8 }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId, teamId: input.teamId }
            })
            if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(input.sessionId) })

            const deleted = await ctx.prisma.skillCheckSession.delete({
                where: { id: input.sessionId, teamId: input.teamId },
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
     * Delete a skill check from a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and skill check ID.
     * @returns The deleted skill check data.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    deleteSessionCheck: sessionProcedure
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
     * Get the users that can be assigned as assessors for a skill check session.
     */
    getAvailableAssessors: sessionProcedure
        .output(z.array(personRefSchema))
        .query(async ({ ctx }) => {

            const clerkClient = ctx.getClerkClient()

            const { data: orgMemberships } = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: ctx.skillCheckSession.team.clerkOrgId, limit: 100 })
            const userIds = orgMemberships.map(m => m.publicUserData!.userId)

            const { data: users } = await clerkClient.users.getUserList({ userId: userIds, limit: 100 })

            const result = orgMemberships.map(membership => {
                const user = users.find(u => u.id === membership.publicUserData!.userId)!
                
                return toPersonRef({ id: user.publicMetadata.person_id, name: user.fullName!, email: user.primaryEmailAddress!.emailAddress })
            })

            return result
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

    /**
     * Get a list of assessees for a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assessees for the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    getSessionAssessees: sessionProcedure
        .output(z.array(personRefSchema))
        .query(async ({ ctx, input }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    assessees: { 
                        select: { id: true, name: true, email: true },
                        orderBy: { name: 'asc' }
                    }
                }
            })

            return (session?.assessees ?? []).map(toPersonRef)
        }),

    /**
     * Get a list of assessors for a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assessors for the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    getSessionAssessors: sessionProcedure
        .output(z.array(personRefSchema))
        .query(async ({ ctx, input }) => {
        
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: input.sessionId },
                include: {
                    assessors: { 
                        select: { id: true, name: true, email: true },
                        orderBy: { name: 'asc' }
                    }
                }
            })

            return (session?.assessors ?? []).map(toPersonRef)
        }),

    /**
     * Fetch the skill ids associated with a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assigned skill ids for the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    getSessionSkillIds: sessionProcedure
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
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    getSessionChecks: sessionProcedure
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
     * Fetch a specific skill check session by ID.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @return The skill check session data.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
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

            if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(input.sessionId) })

            return {
                ...toSkillCheckSessionData(session),
                team: toTeamData(session.team)
            }
        }),

    /**
     * Get checks for one or more members of the specified team.
     * @param ctx The authenticated context.
     * @param input The input data containing the IDs of the members to retrieve checks for.
     * @param input.assesseeIds Optional array of assessee IDs to filter checks by. If not specified, checks for all active members of the team will be returned.
     * @returns An array of skill check data with the specified filters applied.
     */
    getSkillChecks: teamProcedure
        .input(z.object({
            assesseeIds: z.array(zodNanoId8).optional(),
            assessorIds: z.array(zodNanoId8).optional(),
            skillIds: z.array(zodNanoId8).optional(),
        }))
        .output(z.array(skillCheckSchema.extend({ assessee: personSchema, assessor: personSchema, skill: skillSchema })))
        .query(async ({ ctx, input }) => {
            
            const teamMemberIds = (await ctx.prisma.team.findUnique({
                where: { clerkOrgId: ctx.auth.activeTeam.orgId },
                select: {
                    teamMemberships: {
                        where: { status: 'Active' },
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
                    date: 'desc'
                }
            })

            return checks.map(check => ({
                ...toSkillCheckData(check),
                assessee: toPersonData(check.assessee),
                assessor: toPersonData(check.assessor),
                skill: toSkillData(check.skill)
            }))
        }),

    /**
     * Fetch all skill check sessions for a specific team by team ID.
     * @param ctx The authenticated context.
     * @param input The input containing the team ID.
     * @returns An array of skill check sessions for the team.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the team.
     */
    getTeamSessions: teamProcedure
        .output(z.array(skillCheckSessionSchema))
        .query(async ({ ctx, input }) => {

            const sessions = await ctx.prisma.skillCheckSession.findMany({
                where: {
                    team: { id: input.teamId }
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
                },
                orderBy: { date: 'desc' }
            })

            return sessions.map(toSkillCheckSessionData)
        }),


    /**
     * Remove an assessee from a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and assessee ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    removeSessionAssessee: sessionProcedure
        .input(z.object({
            assesseeId: PersonId.schema
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            assessee: personRefSchema
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
                assessee: toPersonRef(updated.assessees[0])
            }
        }),

    /**
     * Remove an assessor from a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and assessor ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    removeSessionAssessor: sessionProcedure
        .input(z.object({
            assessorId: PersonId.schema
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            assessor: personRefSchema
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
                assessor: toPersonRef(updated.assessors[0])
            }
        }),

    /**
     * Remove a skill from a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID and skill ID.
     * @returns The updated skill check session with counts.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    removeSessionSkill: sessionProcedure
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
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    saveSessionCheck: sessionProcedure
        .input(skillCheckSchema.pick({ skillCheckId: true, skillId: true, assesseeId: true, result: true, notes: true }))
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
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    saveSessionChecks: sessionProcedure
        .input(z.object({
            checks: z.array(skillCheckSchema.pick({ skillCheckId: true, skillId: true, assesseeId: true, result: true, notes: true }))
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
     * Update an existing skill check session.
     * @param ctx The authenticated team context.
     * @param input The input containing the session ID and updated data.
     * @returns The updated skill check session data.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist in the active team.
     */
    updateSession: teamAdminProcedure
        .input(skillCheckSessionSchema.pick({ sessionId: true, name: true, date: true }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, teamId, ...update } }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { id: sessionId, teamId }
            })
            if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(sessionId) })

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
     * Update the assessees assigned to the session. Allows adding and removing multiple assessees in one call.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID, additions, and removals.
     * @param input.sessionId The ID of the skill check session to update.
     * @param input.additions An array of assessee IDs to add to the session.
     * @param input.removals An array of assessee IDs to remove from the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    updateSessionAssessees: sessionProcedure
        .input(z.object({
            additions: z.array(PersonId.schema),
            removals: z.array(PersonId.schema)
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
     * Update the assessors assigned to the session. Allows adding and removing multiple assessors in one call.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID, additions, and removals.
     * @param input.sessionId The ID of the skill check session to update.
     * @param input.additions An array of assessor IDs to add to the session.
     * @param input.removals An array of assessor IDs to remove from the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    updateSessionAssessors: sessionProcedure
        .input(z.object({
            additions: z.array(PersonId.schema),
            removals: z.array(PersonId.schema)
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
     * Update the skills assigned to the session. Allows adding and removing multiple skills in one call.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID, additions, and removals.
     * @param input.sessionId The ID of the skill check session to update.
     * @param input.additions An array of skill IDs to add to the session.
     * @param input.removals An array of skill IDs to remove from the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    updateSessionSkills: sessionProcedure
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

            // Get the currently assigned skill ids
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

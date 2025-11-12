/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { UTCDate } from '@date-fns/utc'
import { TRPCError } from '@trpc/server'

import { CompetenceLevel, isPass } from '@/lib/competencies'
import { diffObject } from '@/lib/diff'
import { toPersonData, personSchema, personRefSchema, toPersonRef, PersonId, PersonRef } from '@/lib/schemas/person'
import { toSkillData, skillSchema, SkillId, SkillData } from '@/lib/schemas/skill'
import { toSkillCheckData, skillCheckSchema, SkillCheckId, SkillCheckData } from '@/lib/schemas/skill-check'
import { toSkillCheckSessionData, skillCheckSessionSchema, SkillCheckSessionId } from '@/lib/schemas/skill-check-session'

import { createTRPCRouter, orgAdminProcedure, orgProcedure } from '../init'
import { Messages } from '../messages'



const sessionProcedure = orgProcedure
    .input(z.object({ sessionId: SkillCheckSessionId.schema }))
    .use(async ({ ctx, input, next }) => {
        const session = await ctx.prisma.skillCheckSession.findUnique({
            where: { sessionId: input.sessionId, orgId: ctx.auth.activeOrg.orgId },
        })

        if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(input.sessionId) })

        return next({
            ctx: {
                ...ctx,
                skillCheckSession: session
            }
        })
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
            assesseeId: PersonId.schema
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            assessee: personSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, assesseeId } }) => {

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { sessionId },
                data: {
                    assessees: {
                        connect: { personId: assesseeId }
                    },
                    changeLogs: {
                        create: {
                            event: 'AddAssessee',
                            userId: ctx.auth.userId,
                            meta: { assesseeId }
                        }
                    }
                },
                include: {
                    assessees: {
                        where: { personId: assesseeId },
                    },
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
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
            assessorId: PersonId.schema
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            assessor: personSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, assessorId } }) => {

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { sessionId },
                data: {
                    assessors: {
                        connect: { personId: assessorId }
                    },
                    changeLogs: {
                        create: {
                            event: 'AddAssessor',
                            userId: ctx.auth.userId,
                            meta: { assessorId }
                        }
                    }
                },
                include: {
                    assessors: {
                        where: { personId: assessorId },
                    },
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
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
            sessionId: SkillCheckSessionId.schema,
            skillId: SkillId.schema
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            skill: skillSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, skillId } }) => {

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { sessionId },
                data: {
                    skills: {
                        connect: { skillId }
                    },
                    changeLogs: {
                        create: {
                            event: 'AddSkill',
                            userId: ctx.auth.userId,
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
                        where: { skillId },
                    }
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
    createIndependentSkillCheck: orgProcedure
        .input(skillCheckSchema.pick({ skillCheckId: true, skillId: true, assesseeId: true, result: true, notes: true, date: true }))
        .output(skillCheckSchema)
        .mutation(async ({ ctx, input }) => {

            console.log("Creating independent skill check:", input)
            console.log(`Assessor user ID: ${ctx.auth.userId}, orgId: ${ctx.auth.activeOrg.orgId}`)

            // Validate the assessor exists in the organization
            const assessor = await ctx.prisma.person.findFirst({
                where: { userId: ctx.auth.userId, orgId: ctx.auth.activeOrg.orgId }
            })

            console.log("Assessor record:", assessor)

            if(!assessor) throw new TRPCError({ code: 'FORBIDDEN', message: "Only users linked to a person can create skill checks." })

            const created = await ctx.prisma.skillCheck.create({
                data: {
                    skillCheckId: input.skillCheckId,
                    orgId: ctx.auth.activeOrg.orgId,
                    passed: isPass(input.result as CompetenceLevel),
                    result: input.result,
                    notes: input.notes,
                    date: input.date,
                    checkStatus: 'Include',
                    skillId: input.skillId,
                    assesseeId: input.assesseeId,
                    assessorId: assessor.personId
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
    createSession: orgAdminProcedure
        .input(skillCheckSessionSchema.omit({ sessionStatus: true }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, ...fields } }) => {

            const existingSession = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId }
            })
            if( existingSession ) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: `Session with ID ${sessionId} already exists.` })
            }

            const changes = diffObject({}, fields)

            const session = await ctx.prisma.skillCheckSession.create({
                data: {
                    sessionId,
                    orgId: fields.orgId,
                    name: fields.name,
                    notes: fields.notes,
                    date: fields.date,
                    changeLogs: {
                        create: {
                            event: 'Create',
                            userId: ctx.auth.userId,
                            changes: changes as object[],
                        },
                    },
                },
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
    deleteSession: orgAdminProcedure
        .input(z.object({ sessionId: SkillCheckSessionId.schema }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId } }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId }
            })
            if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(sessionId) })

            const deleted = await ctx.prisma.skillCheckSession.delete({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
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
            sessionId: SkillCheckSessionId.schema,
            skillCheckId: SkillCheckId.schema
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            check: skillCheckSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, skillCheckId } }) => {

            const timestamp = new UTCDate()

            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                include: {
                    checks: {
                        where: { skillCheckId },
                    }
                }
            })

            if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(sessionId) })

            const existingCheck = session!.checks[0]

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { sessionId },
                data: {
                    checks: {
                        delete: {
                            skillCheckId
                        }
                    },
                    changeLogs: {
                        create: {
                            event: 'DeleteCheck',
                            userId: ctx.auth.userId,
                            timestamp,
                            meta: {
                                skillCheckId,
                                sessionId,
                                assesseeId: existingCheck.assesseeId,
                                assessorId: existingCheck.assessorId,
                            },
                        }
                    }
                },
            })
            return {
                session: toSkillCheckSessionData(updated),
                check: toSkillCheckData(existingCheck)
            }
        }),

    /**
     * Get a list of assessees that are assigned to a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assessees for the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    getSessionAssignedAssessees: sessionProcedure
        .output(z.array(personRefSchema))
        .query(async ({ ctx, input: { sessionId } }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                include: {
                    assessees: { 
                        select: { personId: true, name: true, email: true, status: true },
                        orderBy: { name: 'asc' }
                    }
                }
            })

            if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(sessionId) })

            return session.assessees.map(toPersonRef)
        }),

    /**
     * Get a list of assessors for a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assessors for the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    getSessionAssignedAssessors: sessionProcedure
        .output(z.array(personRefSchema))
        .query(async ({ ctx, input: { sessionId } }) => {
        
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                include: {
                    assessors: { 
                        select: { personId: true, name: true, email: true, status: true },
                        orderBy: { name: 'asc' }
                    }
                }
            })

            if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(sessionId) })

            return session.assessors.map(toPersonRef)
        }),

    /**
     * Fetch the skill ids associated with a skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of assigned skill ids for the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    getSessionAssignedSkillIds: sessionProcedure
        .output(z.array(SkillId.schema))
        .query(async ({ ctx, input: { sessionId } }) => {
            
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                include: {
                    skills: {
                        select: { skillId: true }
                    }
                }
            })

            if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(sessionId) })

            return session.skills.map(s => s.skillId)
        }),
        
    /**
     * Get a list of distinct assessees that have been checked in a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of distinct assessees for the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    getSessionDistinctAssessees: sessionProcedure
        .output(z.array(personRefSchema))
        .query(async ({ ctx, input: { sessionId } }) => {
            const checksWithUniqueAssessees = await ctx.prisma.skillCheck.findMany({
                where: { sessionId },
                distinct: ['assesseeId'],
                include: {
                    assessee: { select: { personId: true, name: true, email: true, status: true } },
                }
            })

            return checksWithUniqueAssessees.map(a => toPersonRef(a.assessee))
        }),

    getSessionDistinctAssessors: sessionProcedure
        .output(z.array(personRefSchema))
        .query(async ({ ctx, input: { sessionId } }) => {
            const checksWithUniqueAssessors = await ctx.prisma.skillCheck.findMany({
                where: { sessionId },
                distinct: ['assessorId'],
                include: {
                    assessor: { select: { personId: true, name: true, email: true, status: true } },
                }
            })

            return checksWithUniqueAssessors.map(a => toPersonRef(a.assessor))
        }),

    /**
     * Get a list of distinct skills that have been checked in a specific skill check session.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @returns An array of distinct skills for the session.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    getSessionDistinctSkills: sessionProcedure
        .output(z.array(skillSchema))
        .query(async ({ ctx, input }) => {
            const checksWithUniqueSkills = await ctx.prisma.skillCheck.findMany({
                where: { sessionId: input.sessionId },
                distinct: ['skillId'],
                include: {
                    skill: true,
                }
            })

            return checksWithUniqueSkills.map(c => toSkillData(c.skill))
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
            assessorId: z.union([PersonId.schema, z.literal('me')]).optional()
        }))
        .output(z.array(skillCheckSchema))
        .query(async ({ ctx, input: { sessionId, assessorId } }) => {
            if(assessorId === 'me') {
                const assessor = await ctx.prisma.person.findFirst({
                    where: { userId: ctx.auth.userId, orgId: ctx.auth.activeOrg.orgId }
                })
                if(!assessor) {
                    throw new TRPCError({ code: 'FORBIDDEN', message: "Only users linked to a person can filter by 'me'." })
                }
                assessorId = assessor.personId as PersonId
            }

            const checks = await ctx.prisma.skillCheck.findMany({
                where: { 
                    orgId: ctx.auth.activeOrg.orgId, 
                    sessionId, 
                    assessorId: assessorId
                },
            })

            return checks.map(toSkillCheckData)
        }),

    /**
     * Fetch a specific skill check session by ID.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID.
     * @return The skill check session data.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    getSession: sessionProcedure
        .output(skillCheckSessionSchema)
        .query(async ({ ctx, input: { sessionId } }) => {

            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
            })

            if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(sessionId) })

            return toSkillCheckSessionData(session)
        }),


    /**
     * Fetch all skill check sessions for the active organization.
     * @param ctx The authenticated context.
     * @param input The input containing the team ID.
     * @returns An array of skill check sessions for the team.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the team.
     */
    getSessions: orgProcedure
        .input(z.object({
            status: z.enum(['Draft', 'Include', 'Exclude']).array().optional(),
        }))
        .output(z.array(skillCheckSessionSchema))
        .query(async ({ ctx, input }) => {

            const sessions = await ctx.prisma.skillCheckSession.findMany({
                where: {
                    orgId: ctx.auth.activeOrg.orgId,
                    sessionStatus: input.status ? { in: input.status } : undefined
                },
                orderBy: { date: 'desc' }
            })

            return sessions.map(toSkillCheckSessionData)
        }),

    getSessionStats: sessionProcedure
        .output(z.object({
            recordedChecksCount: z.number(),
            assignedAssesseesCount: z.number(),
            assignedAssessorsCount: z.number(),
            assignedSkillsCount: z.number(),
        }))
        .query(async ({ ctx, input: { sessionId } }) => {

           const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                include: {
                    _count: {
                        select: {
                            checks: true,
                            assessees: true,
                            assessors: true,
                            skills: true
                        }
                    }
                }
            })

            return {
                recordedChecksCount: session?._count.checks ?? 0,
                assignedAssesseesCount: session?._count.assessees ?? 0,
                assignedAssessorsCount: session?._count.assessors ?? 0,
                assignedSkillsCount: session?._count.skills ?? 0,
            }
        }),

    /**
     * Get checks for one or more members of the active organization..
     * @param ctx The authenticated context.
     * @param input The input data containing the IDs of the members to retrieve checks for.
     * @param input.assesseeIds Optional array of assessee IDs to filter checks by. If not specified, checks for all active members of the organization will be returned.
     * @returns An array of skill check data with the specified filters applied.
     */
    getSkillChecks: orgProcedure
        .input(z.object({
            assesseeId: z.array(PersonId.schema).optional(),
            assessorId: z.array(PersonId.schema).optional(),
            skillId: z.array(SkillId.schema).optional(),
            sessionId: z.array(SkillCheckSessionId.schema).optional(),
            results: z.array(z.string()).optional(),
            from :z.string().date().optional(),
            to :z.string().date().optional(),
            limit: z.number().min(1).max(1000).optional().default(1000),
            offset: z.number().min(0).optional().default(0),
        }))
        .output(z.array(skillCheckSchema.extend({ assessee: personRefSchema, assessor: personRefSchema, skill: skillSchema })))
        .query(async ({ ctx, input }) => {
            
            const checks = await ctx.prisma.skillCheck.findMany({
                take: input.limit,
                skip: input.offset,
                where: {
                    orgId: ctx.auth.activeOrg.orgId,
                    assessee: { personId: input.assesseeId ? { in: input.assesseeId } : undefined },
                    assessor: { personId: input.assessorId ? { in: input.assessorId } : undefined },
                    skill: { skillId: input.skillId ? { in: input.skillId } : undefined },
                    sessionId: input.sessionId ? { in: input.sessionId } : undefined,
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
                assessee: toPersonRef(check.assessee),
                assessor: toPersonRef(check.assessor),
                skill: toSkillData(check.skill)
            }))
        }),

    getRecentSkillChecksGrouped: orgProcedure
        .output(z.array(
            z.object({
                assessor: personRefSchema,
                date: z.string().date(),
                checks: z.array(skillCheckSchema.extend({ assessee: personRefSchema, skill: skillSchema }))
            })
        ))
        .query(async ({ ctx }) => {
            
            const checks = await ctx.prisma.skillCheck.findMany({
                where: { orgId: ctx.auth.activeOrg.orgId },
                include: {
                    assessor: { select: { personId: true, name: true, email: true, status: true } },
                    assessee: { select: { personId: true, name: true, email: true, status: true } },
                    skill: true
                },
                orderBy: { date: 'desc' },
                take: 100
            })
            if(checks.length == 0) return []

            const result: { assessor: PersonRef; date: string; checks: (SkillCheckData & { assessee: PersonRef; skill: SkillData })[] }[] = []

            let curDate = checks[0].date
            let byAssessor: Record<string, { assessor: PersonRef; date: string; checks: (SkillCheckData & { assessee: PersonRef; skill: SkillData })[] }> = {
                [checks[0].assessor.personId]: {
                    assessor: toPersonRef(checks[0].assessor),
                    date: curDate,
                    checks: [{
                        ...toSkillCheckData(checks[0]),
                        assessee: toPersonRef(checks[0].assessee),
                        skill: toSkillData(checks[0].skill)
                    }]
                }
            }

            for(const check of checks.slice(1)) {
                const isSameDate = check.date == curDate

                if(!isSameDate) {
                    // End of date, push all current assessors to result and reset
                    result.push(...Object.values(byAssessor).sort((a, b) => a.assessor.name.localeCompare(b.assessor.name)))
                    
                    // reset the assessor grouping for the new date
                    curDate = check.date
                    byAssessor = {}
                }

                const group = byAssessor[check.assessor.personId]
                if(group) {
                    // Existing assessor group for this date ands assessor
                    group.checks.push({
                        ...toSkillCheckData(check),
                        assessee: toPersonRef(check.assessee),
                        skill: toSkillData(check.skill)
                    })
                } else {
                    // New assessor group for this date and assessor
                    byAssessor[check.assessor.personId] = {
                        assessor: toPersonRef(check.assessor),
                        date: curDate,
                        checks: [{
                            ...toSkillCheckData(check),
                            assessee: toPersonRef(check.assessee),
                            skill: toSkillData(check.skill)
                        }]
                    }
                }
            }

            // Push any remaining groups
            result.push(...Object.values(byAssessor).sort((a, b) => a.assessor.name.localeCompare(b.assessor.name)))

            return result
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
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                data: {
                    assessees: {
                        disconnect: { personId: assesseeId }
                    },
                    changeLogs: {
                        create: {
                            event: 'RemoveAssessee',
                            userId: ctx.auth.userId,
                            meta: { assesseeId }
                        }
                    }
                },
                include: {
                    assessees: {
                        where: { personId: assesseeId },
                    },
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
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
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                data: {
                    assessors: {
                        disconnect: { personId: assessorId }
                    },
                    changeLogs: {
                        create: {
                            event: 'RemoveAssessor',
                            userId: ctx.auth.userId,
                            meta: { assessorId }
                        }
                    }
                },
                include: {
                    assessors: {
                        where: { personId: assessorId },
                    },
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
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
            skillId: SkillId.schema
        }))
        .output(z.object({
            session: skillCheckSessionSchema,
            skill: skillSchema
        }))
        .mutation(async ({ ctx, input: { sessionId, skillId } }) => {

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                data: {
                    skills: {
                        disconnect: { skillId }
                    },
                    changeLogs: {
                        create: {
                            event: 'RemoveSkill',
                            userId: ctx.auth.userId,
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
                        where: { skillId },
                    },
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

            // Validate the assessor exists in the organization
            const assessor = await ctx.prisma.person.findFirst({
                where: { userId: ctx.auth.userId, orgId: ctx.auth.activeOrg.orgId }
            })
            if(!assessor) throw new TRPCError({ code: 'FORBIDDEN', message: "Only users linked to a person can create skill checks." })

            const session = ctx.skillCheckSession

            const updated = await ctx.prisma.skillCheckSession.update({
                where: { sessionId: input.sessionId },
                data: {
                    checks: {
                        upsert: {
                            where: { skillCheckId: input.skillCheckId },
                            create: {
                                skillCheckId: input.skillCheckId,
                                orgId: ctx.auth.activeOrg.orgId,
                                passed: isPass(input.result as CompetenceLevel),
                                result: input.result,
                                notes: input.notes,
                                date: session.date,
                                checkStatus: 'Draft',
                                skillId: input.skillId,
                                assesseeId: input.assesseeId,
                                assessorId: assessor.personId,
                                
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
                        where: { skillCheckId: input.skillCheckId },
                    },
                    _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
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
            // Validate the assessor exists in the organization
            const assessor = await ctx.prisma.person.findFirst({
                where: { userId: ctx.auth.userId, orgId: ctx.auth.activeOrg.orgId }
            })
            if(!assessor) throw new TRPCError({ code: 'FORBIDDEN', message: "Only users linked to a person can create skill checks." })

            const session = ctx.skillCheckSession

            const upsertedChecks = await Promise.all(input.checks.map(async inputCheck => ctx.prisma.skillCheck.upsert({
                    where: { skillCheckId: inputCheck.skillCheckId },
                    create: {
                        skillCheckId: inputCheck.skillCheckId,
                        orgId: ctx.auth.activeOrg.orgId,
                        passed: isPass(inputCheck.result as CompetenceLevel),
                        result: inputCheck.result,
                        notes: inputCheck.notes,
                        date: session.date,
                        checkStatus: 'Draft',
                        skillId: inputCheck.skillId,
                        sessionId: input.sessionId,
                        assesseeId: inputCheck.assesseeId,
                        assessorId: assessor.personId,
                    },
                    update: {
                        result: inputCheck.result,
                        notes: inputCheck.notes,
                    }
                })
            ))

            const updatedSession = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId: input.sessionId },
                include: {
                     _count: {
                        select: {
                            skills: true,
                            assessees: true,
                            assessors: true,
                            checks: true
                        }
                    },
                }
            })

            return {
                session: toSkillCheckSessionData(updatedSession!),
                checks: upsertedChecks.map(toSkillCheckData)
            }
        }),

    /**
     * Save the review of a skill check session, updating session status and included/excluded checks.
     * @param ctx The authenticated context.
     * @param input The input containing the session ID, session status, included check IDs, and excluded check IDs.
     * @returns The updated skill check session data.
     * @throws TRPCError(FORBIDDEN) if the user does not have access to the session.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist.
     */
    saveSessionReview: sessionProcedure
        .input(z.object({
            
            sessionStatus: z.enum(['Draft', 'Include', 'Exclude']),
            includedCheckIds: z.array(SkillCheckId.schema),
            excludedCheckIds: z.array(SkillCheckId.schema),
        }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, sessionStatus, includedCheckIds, excludedCheckIds } }) => {
            
            const session = ctx.skillCheckSession

            const updatedSession = { ...session, sessionStatus }

            const existingChecks = await ctx.prisma.skillCheck.findMany({ where: { sessionId } })

            const checksToMarkExclude = existingChecks.filter(c => c.checkStatus != 'Exclude' && excludedCheckIds.includes(c.skillCheckId as SkillCheckId))
            const checksToMarkInclude = existingChecks.filter(c => c.checkStatus != 'Include' && includedCheckIds.includes(c.skillCheckId as SkillCheckId))

            const changes = diffObject(session, updatedSession)
            if(changes.length == 0 && checksToMarkExclude.length == 0 && checksToMarkInclude.length == 0) {
                return toSkillCheckSessionData(session) // No changes
            }

            // Update session status if changed
            if(sessionStatus !== session.sessionStatus) {
                await ctx.prisma.skillCheckSession.update({
                    where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                    data: {
                        sessionStatus,
                        changeLogs: {
                            create: {
                                event: 'Update',
                                userId: ctx.auth.userId,
                                changes: changes as object[],
                            }
                        },
                    }
                })
            }

            // Update included checks
            if(checksToMarkInclude.length > 0) {
                await ctx.prisma.skillCheck.updateMany({
                    where: {
                        skillCheckId: { in: checksToMarkInclude.map(c => c.skillCheckId) },
                        sessionId,
                    },
                    data: {
                        checkStatus: 'Include',
                    }
                })
            }

            // Update excluded checks
            if(checksToMarkExclude.length > 0) {
                await ctx.prisma.skillCheck.updateMany({
                    where: {
                        skillCheckId: { in: checksToMarkExclude.map(c => c.skillCheckId) },
                        sessionId,
                    },
                    data: {
                        checkStatus: 'Exclude',
                    }
                })
            }

            return toSkillCheckSessionData(updatedSession)
        }),

    /**
     * Update an existing skill check session.
     * @param ctx The authenticated team context.
     * @param input The input containing the session ID and updated data.
     * @returns The updated skill check session data.
     * @throws TRPCError(NOT_FOUND) if the session with the given ID does not exist in the active team.
     */
    updateSession: orgAdminProcedure
        .input(skillCheckSessionSchema.omit({ sessionStatus: true }))
        .output(skillCheckSessionSchema)
        .mutation(async ({ ctx, input: { sessionId, ...fields } }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId }
            })
            if(!session) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.sessionNotFound(sessionId) })

            const changes = diffObject(skillCheckSessionSchema.omit({ sessionId: true, sessionStatus: true }).parse(session), fields)
            if(changes.length == 0) return toSkillCheckSessionData(session) // No changes

            const updatedSession = await ctx.prisma.skillCheckSession.update({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                data: {
                    ...fields,
                    changeLogs: {
                        create: {
                            event: 'Update',
                            userId: ctx.auth.userId,
                            changes: changes as object[],
                        },
                    },
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
                where: { sessionId },
                include: { assessees: { select: { personId: true }} }
            })
            const assignedAssesseeIds = (session?.assessees ?? []).map(s => s.personId)

            // Filter out any additions that are already set in the database
            additions = additions.filter(idToAdd => !assignedAssesseeIds.includes(idToAdd))

            // Filter out any removals that are not currently set in the database
            removals = removals.filter(idToRemove => assignedAssesseeIds.includes(idToRemove))

            await ctx.prisma.skillCheckSession.update({
                where: { sessionId, orgId: ctx.auth.activeOrg.orgId },
                data: {
                    assessees: {
                        connect:  additions.map(id => ({ personId: id })),
                        disconnect: removals.map(id => ({ personId: id }))
                    },
                    changeLogs: {
                        create: [
                            ...additions.map(assesseeId => ({
                                event: 'AddAssessee',
                                userId: ctx.auth.userId,
                                meta: { assesseeId }
                            } as const)),
                            ...removals.map(assesseeId => ({
                                event: 'RemoveAssessee',
                                userId: ctx.auth.userId,
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
                where: { sessionId },
                include: { assessors: { select: { personId: true }} }
            })

             const assignedAssessorIds = (session?.assessors ?? []).map(s => s.personId)

            // Filter out any additions that are already set in the database
            additions = additions.filter(idToAdd => !assignedAssessorIds.includes(idToAdd))

            // Filter out any removals that are not currently set in the database
            removals = removals.filter(idToRemove => assignedAssessorIds.includes(idToRemove))

            await ctx.prisma.skillCheckSession.update({
                where: { sessionId },
                data: {
                    assessors: {
                        connect: additions.map(id => ({ personId: id })),
                        disconnect: removals.map(id => ({ personId: id }))
                    },
                    changeLogs: {
                        create: [
                            ...additions.map(assessorId => ({
                                event: 'AddAssessor',
                                userId: ctx.auth.userId,
                                meta: { assessorId }
                            } as const)),
                            ...removals.map(assessorId => ({
                                event: 'RemoveAssessor',
                                userId: ctx.auth.userId,
                                meta: { assessorId }
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
            additions: z.array(SkillId.schema),
            removals: z.array(SkillId.schema)
        }))
        .output(z.object({
            addCount: z.number(),
            removeCount: z.number(),
        }))
        .mutation(async ({ ctx, input: { sessionId, additions, removals } }) => {
            const session = await ctx.prisma.skillCheckSession.findUnique({
                where: { sessionId },
                include: { skills: { select: { skillId: true }} }
            })

            // Get the currently assigned skill ids
            const assignedSkillIds = (session?.skills ?? []).map(s => s.skillId)


            // Filter out any additions that are already set in the database
            additions = additions.filter(idToAdd => !assignedSkillIds.includes(idToAdd))

            // Filter out any removals that are not currently set in the database
            removals = removals.filter(idToRemove => assignedSkillIds.includes(idToRemove))

            await ctx.prisma.skillCheckSession.update({
                where: { sessionId },
                data: {
                    skills: {
                        connect: additions.map(id => ({ skillId: id })),
                        disconnect: removals.map(id => ({ skillId: id }))
                    },
                    changeLogs: {
                        create: [
                            ...additions.map(skillId => ({
                                event: 'AddSkill',
                                userId: ctx.auth.userId,
                                meta: { skillId }
                            } as const)),
                            ...removals.map(skillId => ({
                                event: 'RemoveSkill',
                                userId: ctx.auth.userId,
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

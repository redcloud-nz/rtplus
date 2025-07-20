/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { skillCheckSessionFormSchema } from '@/lib/schemas/skill-check-session'
import { nanoId8 } from '@/lib/id'
import { zodNanoId8 } from '@/lib/validation'

import { authenticatedProcedure, createTRPCRouter } from '../init'
import { SkillCheckSessionWithCounts } from '../types'



export const skillCheckSessionsRouter = createTRPCRouter({
    mySessions: {
        all: authenticatedProcedure
            .query(async ({ ctx }): Promise<SkillCheckSessionWithCounts[]> => {
                const sessions = await ctx.prisma.skillCheckSession.findMany({
                    where: { assessorId: ctx.personId },
                    include: {
                        _count: {
                            select: { skills: true, assessees: true, checks: true }
                        }
                    }
                })
                return sessions
            }),
        byId: authenticatedProcedure
            .input(z.object({ sessionId: zodNanoId8 }))
            .query(async ({ ctx, input: { sessionId } }): Promise<SkillCheckSessionWithCounts> => {
                const session = await ctx.prisma.skillCheckSession.findUnique({
                    where: { id: sessionId, assessorId: ctx.personId },
                    include: {
                        _count: {
                            select: { skills: true, assessees: true, checks: true }
                        }
                    }
                })
                if(!session) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: `SkillCheckSession(${sessionId}) not found.` })
                }
                return session
            }),
        create: authenticatedProcedure
            .input(skillCheckSessionFormSchema)
            .mutation(async ({ ctx, input: { sessionId, date, ...input }}): Promise<SkillCheckSessionWithCounts> => {
                
                const createdSession = await ctx.prisma.skillCheckSession.create({
                    data: {
                        id: sessionId,
                        assessorId: ctx.personId,
                        date: date ? new Date(date) : new Date(),
                        ...input
                    },
                    include: {
                        _count: {
                            select: { skills: true, assessees: true, checks: true }
                        }
                    }
                })
                        
                return createdSession
            }),
        init: authenticatedProcedure
            .mutation(async ({ ctx }): Promise<SkillCheckSessionWithCounts> => {
                const year = new Date().getFullYear()

                const sessions = await ctx.prisma.skillCheckSession.findMany({
                    select: { id: true, name: true },
                    where: { assessorId: ctx.personId,  name: { startsWith: `${year} #` } }
                })

                let higestSessionNumber = 0
                for (const session of sessions) {
                    const number = parseInt(session.name.split(' ')[1])
                    if (number > higestSessionNumber) {
                        higestSessionNumber = number
                    }
                }

                const newSessionNumber = higestSessionNumber + 1

                const createdSession = await ctx.prisma.skillCheckSession.create({
                    data: {
                        id: nanoId8(),
                        assessorId: ctx.personId,
                        date: new Date(),
                        sessionStatus: 'Draft',
                        name: `${year} #${newSessionNumber}`
                    },
                    include: {
                        _count: {
                            select: { skills: true, assessees: true, checks: true }
                        }
                    }
                })
                
                return createdSession
            }),
        sessionPersonnel: authenticatedProcedure
            .input(z.object({ sessionId: zodNanoId8 }))
            .query(async ({ ctx, input: { sessionId } }): Promise<string[]> => {
                const session = await ctx.prisma.skillCheckSession.findUnique({
                    where: { id: sessionId, assessorId: ctx.personId },
                    select: { assessees: { select: { id: true } } }
                })
                if(!session) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: `SkillCheckSession(${sessionId}) not found.` })
                }
                return session.assessees.map(assessee => assessee.id)
            }),
        sessionSkills: authenticatedProcedure
            .input(z.object({ sessionId: zodNanoId8 }))
            .query(async ({ ctx, input: { sessionId } }): Promise<string[]> => {
                const session = await ctx.prisma.skillCheckSession.findUnique({
                    where: { id: sessionId, assessorId: ctx.personId },
                    select: { skills: { select: { id: true } } }
                })
                if(!session) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: `SkillCheckSession(${sessionId}) not found.` })
                }
                return session.skills.map(skill => skill.id)
            }),
        
    },

    
})
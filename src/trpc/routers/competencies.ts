/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import z from 'zod'

import { shortId } from '@/lib/id'
import { zodShortId } from '@/lib/validation'

import { TRPCError } from '@trpc/server'

import { createTRPCRouter, teamMemberProcedure } from '../init'




export const competenciesRouter = createTRPCRouter({

    /**
     * Record an individual skill check
     */
    recordSkillCheck: teamMemberProcedure
        .input(z.object({
            skillId: zodShortId,
            assesseeId: zodShortId,
            competenceLevel: z.enum(['NotTaught', 'NotCompetent', 'Competent', 'HighlyConfident']),
            notes: z.string().max(1000),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.skillCheck.create({
                    data: {
                        skillId: input.skillId,
                        assesseeId: input.assesseeId,
                        assessorId: ctx.personId,
                        competenceLevel: input.competenceLevel,
                        notes: input.notes,
                    }
                })
            } catch(error ) {
                return new TRPCError({ code: 'BAD_REQUEST', message: ''+error })
            }
        }),

    sessions: {
        all: teamMemberProcedure
            .query(async ({ ctx }) => {
                const sessions = await ctx.prisma.skillCheckSession.findMany({
                    where: { assessorId: ctx.personId },
                    orderBy: { date: 'desc' },
                    include: {
                        _count: {
                            select: { skills: true, assessees: true, checks: true }
                        }
                    }
                })

                return sessions
            }),

        byId: teamMemberProcedure
            .input(z.object({ 
                sessionId: zodShortId
            }))
            .query(async ({ ctx, input }) => {
                const session = await ctx.prisma.skillCheckSession.findUnique({
                    where: { id: input.sessionId },
                    include: {
                        _count: {
                            select: { skills: true, assessees: true, checks: true }
                        }
                    }
                })

                return session
            }),

        /**
         * Create a new skill check session.
         */
        create: teamMemberProcedure
            .mutation(async ({ ctx }) => {
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

                const newSession = await ctx.prisma.skillCheckSession.create({
                    data: {
                        id: shortId(),
                        assessorId: ctx.personId,
                        date: new Date(),
                        name: `${year} #${newSessionNumber}`
                    }
                })

                return newSession
            }),
    }
})


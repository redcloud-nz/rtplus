/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { skillCheckSessionFormSchema } from '@/lib/forms/skill-check-session'

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
        create: authenticatedProcedure
            .input(skillCheckSessionFormSchema)
            .mutation(async ({ ctx, input: { sessionId, ...input }}): Promise<SkillCheckSessionWithCounts> => {
                
                const createdSession = await ctx.prisma.skillCheckSession.create({
                    data: {
                        id: sessionId,
                        assessorId: ctx.personId,
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
    },

    
})
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import z from 'zod'
import { TRPCError } from '@trpc/server'

import { teamProcedure, createTRPCRouter } from '../init'


export const competenciesRouter = createTRPCRouter({
    
    recordSkillCheck: teamProcedure
        .input(z.object({
            skillId: z.string().uuid(),
            assesseeId: z.string().uuid(),
            competenceLevel: z.enum(['NotTaught', 'NotCompetent', 'Competent', 'HighlyConfident']),
            notes: z.string().max(1000),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.skillCheck.create({
                    data: {
                        skillId: input.skillId,
                        assesseeId: input.assesseeId,
                        assessorId: ctx.userPersonId,
                        competenceLevel: input.competenceLevel,
                        notes: input.notes,
                    }
                })
            } catch(error ) {
                return new TRPCError({ code: 'BAD_REQUEST', message: ''+error })
            }
        })
})


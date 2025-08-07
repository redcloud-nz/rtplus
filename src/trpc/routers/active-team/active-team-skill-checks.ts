/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { UTCDate } from '@date-fns/utc'

import { createSkillCheckData, skillCheckSchema } from '@/lib/schemas/skill-check'
import { authenticatedProcedure, createTRPCRouter } from '@/trpc/init'


export const activeTeamSkillChecksRouter = createTRPCRouter({

    /**
     * Create a new skill check independently of a session.
     * This is typically used by team admins to record skill checks without an active session.
     * @param ctx The authenticated context.
     * @param input The skill check data to create.
     * @returns The created skill check data.
     * @throws TRPCError(FORBIDDEN) if the user is not a team admin and no session is provided.
     */
    createIndependentSkillCheck: authenticatedProcedure
        .input(skillCheckSchema.omit({ assessorId: true, sessionId: true, timestamp: true }))
        .output(skillCheckSchema)
        .mutation(async ({ ctx, input }) => {

            const timestamp = new UTCDate()
            const assessorId = ctx.personId

            const created = await ctx.prisma.skillCheck.create({
                data: {
                    id: input.skillCheckId,
                    result: input.result,
                    notes: input.notes,
                    timestamp,
                    
                    skill: { connect: { id: input.skillId } },
                    assessee: { connect: { id: input.assesseeId } },
                    assessor: { connect: { id: assessorId } },
                }
            })

            return createSkillCheckData(created)
        })

})
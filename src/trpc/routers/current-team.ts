/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { teamProcedure, createTRPCRouter } from '../init'

/**
 * Router for the current "Active" team
 */
export const currentTeamRouter = createTRPCRouter({

    members: teamProcedure
        .query(async ({ ctx }) => {
            if(!ctx.teamSlug) throw new Error('No current team.')
          
            const team = await ctx.prisma.team.findUnique({ 
                where: { clerkOrgId: ctx.teamSlug },
                include: {
                    teamMemberships: {
                        include: {
                            person: true,
                            d4hInfo: true
                        },
                        orderBy: {
                            person: { name: 'asc' }
                        }
                    }
                }
            })

            if(!team) throw new Error(`Missing active team for teamSlug='${ctx.teamSlug}'`)

            return team.teamMemberships
        })
})
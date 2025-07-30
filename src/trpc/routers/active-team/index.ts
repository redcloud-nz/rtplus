/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { TRPCError } from '@trpc/server'


import { createTRPCRouter, teamAdminProcedure, teamProcedure } from '../../init'
import { getActiveTeam } from '../teams'
import { activeTeamMembersRouter } from './members'
import { teamSchema } from '@/lib/schemas/team'
import { activeTeamUsersRouter } from './users'


export const activeTeamRouter = createTRPCRouter({

    // Submodules for active team

    members: activeTeamMembersRouter,
    users: activeTeamUsersRouter,

    get: teamProcedure
        .output(teamSchema)
        .query(async ({ ctx }) => {
            const team = await getActiveTeam(ctx)

            return { teamId: team.id, ...team }
        }),

    update: teamAdminProcedure
        .input(teamSchema)
        .output(teamSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await getActiveTeam(ctx)

            throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Active team update is not implemented yet.' })
        })
})
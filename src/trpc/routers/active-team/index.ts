/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { TRPCError } from '@trpc/server'

import { teamSchema } from '@/lib/schemas/team'

import { createTRPCRouter, teamAdminProcedure, teamProcedure } from '../../init'
import { getActiveTeam } from '../teams'

import { activeTeamInvitationsRouter } from './active-team-invitations'
import { activeTeamMembersRouter } from './active-team-members'
import { activeTeamUsersRouter } from './active-team-users'



export const activeTeamRouter = createTRPCRouter({

    // Submodules for active team

    invitations: activeTeamInvitationsRouter,
    members: activeTeamMembersRouter,
    users: activeTeamUsersRouter,

    /**
     * Fetch the active team details.
     * @param ctx The authenticated context.
     * @returns The active team data.
     * @throws TRPCError(NOT_FOUND) If the active team is not found.
     */
    get: teamProcedure
        .output(teamSchema)
        .query(async ({ ctx }) => {
            const team = await getActiveTeam(ctx)

            return { teamId: team.id, ...team }
        }),

    /**
     * Update the active team details.
     * @param ctx The authenticated context.
     * @param input The team data to update.
     * @returns The updated team data.
     */
    update: teamAdminProcedure
        .input(teamSchema)
        .output(teamSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await getActiveTeam(ctx)

            throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: 'Active team update is not implemented yet.' })
        })
})
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { teamSchema, toTeamData } from '@/lib/schemas/team'

import { createTRPCRouter, teamAdminProcedure, teamProcedure } from '@/trpc/init'
import { getActiveTeam, updateTeam } from '../teams'

import { activeTeamMembersRouter } from './active-team-members'
import { activeTeamSkillChecksRouter } from './active-team-skill-check-sessions'
import { activeTeamUsersRouter } from './active-team-users'



export const activeTeamRouter = createTRPCRouter({

    // Submodules for active team

    members: activeTeamMembersRouter,
    skillChecks: activeTeamSkillChecksRouter,
    users: activeTeamUsersRouter,

    /**
     * Fetch the active team details.
     * @param ctx The authenticated context.
     * @returns The active team data.
     * @throws TRPCError(NOT_FOUND) If the active team is not found.
     */
    getTeam: teamProcedure
        .output(teamSchema)
        .query(async ({ ctx }) => {
            const team = await getActiveTeam(ctx)

            return toTeamData(team)
        }),

    /**
     * Update the active team details.
     * @param ctx The authenticated context.
     * @param input The team data to update.
     * @returns The updated team data.
     */
    updateTeam: teamAdminProcedure
        .input(teamSchema)
        .output(teamSchema) 
        .mutation(async ({ ctx, input }) => {
            const team = await getActiveTeam(ctx)

            const updated = await updateTeam(ctx, team, input)
            return toTeamData(updated)
        })
})
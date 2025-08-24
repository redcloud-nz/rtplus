/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { teamSchema, toTeamData } from '@/lib/schemas/team'

import { createTRPCRouter, teamProcedure } from '@/trpc/init'
import { getActiveTeam} from '../teams'

import { activeTeamMembersRouter } from './active-team-members'
import { activeTeamSkillChecksRouter } from './active-team-skill-checks'
import { activeTeamSkillCheckSessionsRouter } from './active-team-skill-check-sessions'
import { activeTeamUsersRouter } from './active-team-users'


export const activeTeamRouter = createTRPCRouter({

    // Submodules for active team

    members: activeTeamMembersRouter,
    skillChecks: activeTeamSkillChecksRouter,
    skillCheckSessions: activeTeamSkillCheckSessionsRouter,
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
})
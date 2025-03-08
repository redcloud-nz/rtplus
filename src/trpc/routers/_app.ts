/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { createTRPCRouter } from '../init'

import { competenciesRouter } from './competencies'
import { currentTeamRouter } from './current-team'
import { currentUserRouter } from './current-user'
import { personnelRouter } from './personnel'
import { skillPackagesRouter } from './skill-packages'
import { teamsRouter } from './teams'
import { teamMembershipsRouter } from './team-memberships'

export const appRouter = createTRPCRouter({
    competencies: competenciesRouter,
    currentTeam: currentTeamRouter,
    currentUser: currentUserRouter,
    personnel: personnelRouter,
    skillPackages: skillPackagesRouter,
    teams: teamsRouter,
    teamMemberships: teamMembershipsRouter,
})

export type AppRouter = typeof appRouter
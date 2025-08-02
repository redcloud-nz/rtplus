/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { createTRPCRouter } from '../init'

import { activeTeamRouter } from './active-team'
import { competenciesRouter } from './competencies'
import { currentUserRouter } from './current-user'
import { personnelRouter } from './personnel'
import { skillsRouter } from './skills'
import { skillCheckSessionsRouter } from './skill-check-sessions'
import { skillGroupsRouter } from './skill-groups'
import { skillPackagesRouter } from './skill-packages'
import { teamsRouter } from './teams'
import { teamMembershipsRouter } from './team-memberships'
import { usersRouter } from './users'
import { invitationsRouter } from './invitations'



export const appRouter = createTRPCRouter({
    activeTeam: activeTeamRouter,

    competencies: competenciesRouter,
    currentUser: currentUserRouter,
    invitations: invitationsRouter,
    personnel: personnelRouter,
    skills: skillsRouter,
    skillCheckSessions: skillCheckSessionsRouter,
    skillGroups: skillGroupsRouter,
    skillPackages: skillPackagesRouter,
    teams: teamsRouter,
    teamMemberships: teamMembershipsRouter,
    users: usersRouter,
})

export type AppRouter = typeof appRouter
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { createTRPCRouter } from '../init'

import { competenciesRouter } from './competencies'
import { currentUserRouter } from './current-user'
import { personnelRouter } from './personnel'
import { skillPackagesRouter } from './skill-packages'
import { teamsRouter } from './teams'
import { teamMembershipsRouter } from './team-memberships'
import { orgMembershipsRouter } from './org-memberships'
import { orgInvitationsRouter } from './org-invitations'

export const appRouter = createTRPCRouter({
    competencies: competenciesRouter,
    currentUser: currentUserRouter,
    orgInvitations: orgInvitationsRouter,
    orgMemberships: orgMembershipsRouter,
    personnel: personnelRouter,
    skillPackages: skillPackagesRouter,
    teams: teamsRouter,
    teamMemberships: teamMembershipsRouter,
    
})

export type AppRouter = typeof appRouter
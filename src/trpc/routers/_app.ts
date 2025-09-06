/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { createTRPCRouter } from '../init'

import { currentUserRouter } from './current-user'
import { invitationsRouter } from './invitations'
import { notesRouter } from './notes'
import { personnelRouter } from './personnel'
import { skillsRouter } from './skills'
import { skillChecksRouter } from './skill-checks-router'
import { teamsRouter } from './teams'
import { teamMembershipsRouter } from './team-memberships-router'
import { usersRouter } from './users'



export const appRouter = createTRPCRouter({

    currentUser: currentUserRouter,
    invitations: invitationsRouter,
    notes: notesRouter,
    personnel: personnelRouter,
    skills: skillsRouter,
    skillChecks: skillChecksRouter,
    teams: teamsRouter,
    teamMemberships: teamMembershipsRouter,
    users: usersRouter,
})

export type AppRouter = typeof appRouter
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { createTRPCRouter } from '../init'

import { currentUserRouter } from './current-user-router'
import { notesRouter } from './notes-router'
import { personnelRouter } from './personnel-router'
import { skillsRouter } from './skills-router'
import { skillChecksRouter } from './skill-checks-router'
import { teamsRouter } from './teams-router'
import { teamMembershipsRouter } from './team-memberships-router'
import { usersRouter } from './users-router'



export const appRouter = createTRPCRouter({

    currentUser: currentUserRouter,
    notes: notesRouter,
    personnel: personnelRouter,
    skills: skillsRouter,
    skillChecks: skillChecksRouter,
    teams: teamsRouter,
    teamMemberships: teamMembershipsRouter,
    users: usersRouter,
})

export type AppRouter = typeof appRouter
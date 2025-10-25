/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import { createTRPCRouter } from '../init'

import { notesRouter } from './notes-router'
import { organizationsRouter } from './organizations-router'
import { personnelRouter } from './personnel-router'
import { settingsRouter } from './settings-router'
import { skillsRouter } from './skills-router'
import { skillChecksRouter } from './skill-checks-router'
import { teamsRouter } from './teams-router'
import { teamMembershipsRouter } from './team-memberships-router'



export const appRouter = createTRPCRouter({

    notes: notesRouter,
    organizations: organizationsRouter,
    personnel: personnelRouter,
    settings: settingsRouter,
    skills: skillsRouter,
    skillChecks: skillChecksRouter,
    teams: teamsRouter,
    teamMemberships: teamMembershipsRouter,
})

export type AppRouter = typeof appRouter

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
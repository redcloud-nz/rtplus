/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { createTRPCRouter } from '../init'

import { currentUserRouter } from './current-user'
import { permissionsRouter } from './permissions'
import { personnelRouter } from './personnel'
import { skillPackagesRouter } from './skill-packages'
import { currentTeamRouter } from './current-team'
import { teamsRouter } from './teams'


export const appRouter = createTRPCRouter({
    currentTeam: currentTeamRouter,
    currentUser: currentUserRouter,
    permissions: permissionsRouter,
    personnel: personnelRouter,
    skillPackages: skillPackagesRouter,
    teams: teamsRouter
})

export type AppRouter = typeof appRouter
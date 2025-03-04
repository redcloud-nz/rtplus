/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { createTRPCRouter } from '../init'

import { currentTeamRouter } from './current-team'
import { currentUserRouter } from './current-user'
import { d4hAccessKeysRouter } from './d4h-access-keys'
import { permissionsRouter } from './permissions'
import { personnelRouter } from './personnel'
import { skillPackagesRouter } from './skill-packages'
import { teamsRouter } from './teams'
import { usersRouter } from './users'


export const appRouter = createTRPCRouter({
    currentTeam: currentTeamRouter,
    currentUser: currentUserRouter,
    d4hAccessKeys: d4hAccessKeysRouter,
    permissions: permissionsRouter,
    personnel: personnelRouter,
    skillPackages: skillPackagesRouter,
    teams: teamsRouter,
    users: usersRouter
})

export type AppRouter = typeof appRouter
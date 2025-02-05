/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { createTRPCRouter } from '../init'

import { currentUserRouter } from './current-user'
import { permissionsRouter } from './permissions'
import { personnelRouter } from './personnel'
import { teamsRouter } from './teams'


export const appRouter = createTRPCRouter({
    currentUser: currentUserRouter,
    permissions: permissionsRouter,
    personnel: personnelRouter,
    teams: teamsRouter
})

export type AppRouter = typeof appRouter
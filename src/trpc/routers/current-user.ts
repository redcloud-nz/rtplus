/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/



import { authenticatedProcedure, createTRPCRouter } from '../init'

import { getPersonPermissions } from './permissions'


export const currentUserRouter = createTRPCRouter({
    d4hAccessKeys: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.d4hAccessKey.findMany({ 
                where: { ownerId: ctx.userPersonId },
                include: { team: true }
            })
        }),
    get: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.person.findUnique({ 
                where: { id: ctx.userPersonId }
            })
        }),
    compactPermissions: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.permissions
        }),
    permissions: authenticatedProcedure
        .query(({ ctx }) => getPersonPermissions(ctx, ctx.userPersonId))
})
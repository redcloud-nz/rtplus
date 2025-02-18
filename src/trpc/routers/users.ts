/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { authenticatedProcedure, createTRPCRouter } from '../init'

/**
 * TRPC router for user management.
 */
export const usersRouter = createTRPCRouter({
    all: authenticatedProcedure
        .input(z.object({
            status: z.enum(['Active', 'Inactive']).optional().default('Active')
        }).optional().default({}))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.user.findMany({ 
                where: { status: input.status },
                select: { id: true, name: true, email: true, status: true },
                orderBy: { name: 'asc' }
            })
        }),
    byId: authenticatedProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.user.findUnique({ 
                where: { id: input.userId },
                select: { id: true, name: true, email: true, status: true }
            })
        }),
    create: authenticatedProcedure
        .input(z.object({}))
        .mutation(async ({ input, ctx }) => {
            // TODO
        })
})
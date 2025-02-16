/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z} from 'zod'

import { authenticatedProcedure, createTRPCRouter } from '../init'

export const skillPackagesRouter = createTRPCRouter({
    all: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.skillPackage.findMany({ 
                where: { status: 'Active' },
                orderBy: { name: 'asc' },
                include: {
                    skillGroups: true,
                    skills: true
                }
            })
        }),

    byId: authenticatedProcedure
        .input(z.object({
            skillPackageId: z.string().uuid()
        }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.skillPackage.findUnique({ 
                where: { id: input.skillPackageId },
                include: {
                    skillGroups: true,
                    skills: true
                }
            })
        }),    
})
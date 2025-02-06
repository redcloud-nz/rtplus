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

    list: authenticatedProcedure
        .input(z.object({
            permission:
                z.enum(['skill-package:write']).optional()
                .describe("Filter by the user's permission level (with respect to the skill package)")
        }))
        .query(async ({ ctx, input }) => {
            if(input.permission) {
                const permissions = await ctx.prisma.skillPackagePermission.findMany({
                    where: {
                        personId: ctx.userPersonId,
                        permissions: { has: input.permission }
                    },
                    include: {
                        skillPackage: true
                    }
                })
                return permissions
                    .filter(({ skillPackage }) => skillPackage.status === 'Active')
                    .map(({ skillPackage }) => skillPackage)
            } else {
                return ctx.prisma.skillPackage.findMany({ where: { status: 'Active' } })
            }
        }),
    
    
})
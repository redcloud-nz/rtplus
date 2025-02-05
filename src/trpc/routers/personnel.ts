/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { authenticatedProcedure, createTRPCRouter } from '../init'
import { SkillPackagePermissionKey, SystemPermissionKey, TeamPermissionKey } from '@/server/permissions'


export const personnelRouter = createTRPCRouter({
    list: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.person.findMany({ 
                where: { status: 'Active' },
                select: { id: true, name: true, slug: true, email: true, status: true }
            })
        }),
    get: authenticatedProcedure
        .input(z.object({ personId: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.person.findUnique({ 
                where: { id: input.personId },
                select: { id: true, name: true, slug: true, email: true, status: true }
            })
        }),
    
})
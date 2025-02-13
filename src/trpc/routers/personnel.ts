/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { createPersonFormSchema } from '@/lib/forms/create-person'

import { authenticatedProcedure, createTRPCRouter } from '../init'
import { FieldConflictError } from '../types'


export const personnelRouter = createTRPCRouter({
    byId: authenticatedProcedure
        .input(z.object({ personId: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.person.findUnique({ 
                where: { id: input.personId },
                select: { id: true, name: true, slug: true, email: true, status: true }
            })
        }),

    createPerson: authenticatedProcedure
        .input(createPersonFormSchema)
        .mutation(async ({ input, ctx }) => {
            if(!(ctx.hasPermission('system:manage-personnel') || ctx.hasPermission('team:manage-members', '*'))) 
                throw new TRPCError({ code: 'FORBIDDEN', message: 'system:manage-people permission is required to create a person.' })
                
            const emailConflict = await ctx.prisma.person.findFirst({ where: { email: input.email } })
            if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })

            return await ctx.prisma.person.create({ data: { name: input.name, email: input.email } })
        }),

    list: authenticatedProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.person.findMany({ 
                where: { status: 'Active' },
                select: { id: true, name: true, slug: true, email: true, status: true }
            })
        }),
})
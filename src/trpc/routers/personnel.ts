/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'


import { createTRPCRouter, systemAdminProcedure } from '../init'
import { FieldConflictError } from '../types'
import { updatePersonFormSchema } from '@/lib/forms/update-person'

/**
 * TRPC router for personnel management.
 */
export const personnelRouter = createTRPCRouter({
    all: systemAdminProcedure
        .input(z.object({
            status: z.enum(['Active', 'Inactive']).optional().default('Active')
        }).optional().default({}))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.person.findMany({ 
                where: { status: input.status },
                select: { id: true, name: true, email: true, status: true },
                orderBy: { name: 'asc' }
            })
        }),

    byId: systemAdminProcedure
        .input(z.object({ personId: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.person.findUnique({ 
                where: { id: input.personId },
                select: { id: true, name: true, email: true, status: true }
            })
        }),

    byEmail: systemAdminProcedure
        .input(z.object({ email: z.string().email() }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.person.findUnique({
                where: { email: input.email },
                select: { id: true, name: true, email: true, status: true }
            })
        }),

    create: systemAdminProcedure
        .input(z.object({
            name: z.string().min(3).max(100),
            email: z.string().email(),
        }))
        .mutation(async ({ input, ctx }) => {
                
            const emailConflict = await ctx.prisma.person.findFirst({ where: { email: input.email } })
            if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })

            const newUser = await ctx.prisma.person.create({ 
                data: { 
                    ...input,
                    changeLogs: { 
                        create: { 
                            actorId: ctx.personId,
                            event: 'Create',
                            fields: input
                        }
                    }
                } 
            })

            return newUser
        }),


    delete: systemAdminProcedure
        .input(z.object({ personId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
        
            // TODO Implement delete
        }),

    memberships: systemAdminProcedure
        .input(z.object({ personId: z.string().uuid() }))
        .query(async ({ input, ctx }) => {
            return ctx.prisma.teamMembership.findMany({
                where: { personId: input.personId },
                include: { team: true }
            })
        }),

    update: systemAdminProcedure
        .input(updatePersonFormSchema)
        .mutation(async ({ input, ctx, }) => {

            const existingPerson = await ctx.prisma.person.findUnique({ where: { id: input.id } })
            if(!existingPerson) throw new TRPCError({ code: 'NOT_FOUND', message: 'Person not found.' })

            if(input.email != existingPerson?.email) {
                const emailConflict = await ctx.prisma.person.findFirst({ where: { email: input.email } })
                if(emailConflict) throw new TRPCError({ code: 'CONFLICT', message: 'A person with this email address already exists.', cause: new FieldConflictError('email') })
            }

            const updatedPerson = await ctx.prisma.person.update({ 
                where: { id: input.id },
                data: { 
                    ...input,
                    changeLogs: { 
                        create: { 
                            actorId: ctx.personId,
                            event: 'Update',
                            fields: input
                        }
                    }
                } 
            })
            return updatedPerson
        })
})
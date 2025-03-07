/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { Person } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { RTPlusLogger } from '@/lib/logger'

import { authenticatedProcedure, createTRPCRouter } from '../init'

const logger = new RTPlusLogger('trpc/current-user')

export const currentUserRouter = createTRPCRouter({
    

    /**
     * Get the current user's person record
     */
    person: authenticatedProcedure
        .query(async ({ ctx }): Promise<Person> => {
            const person = await ctx.prisma.person.findUnique({ 
                where: { id: ctx.personId },
                
            })
            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: 'Person not found' })

            return person
        }),

})
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { TRPCError } from '@trpc/server'

// import { RTPlusLogger } from '@/lib/logger'

import { PersonData, personSchema, toPersonData } from '@/lib/schemas/person'

import { authenticatedProcedure, createTRPCRouter } from '../init'


// const logger = new RTPlusLogger('trpc/current-user')

export const currentUserRouter = createTRPCRouter({

    /**
     * Get the current user's person data.
     */
    getPerson: authenticatedProcedure
        .output(personSchema)
        .query(async ({ ctx }): Promise<PersonData> => {
            const person = await ctx.prisma.person.findUnique({ 
                where: { id: ctx.auth.personId },
                
            })
            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person with ID ${ctx.auth.personId} not found.` })

            return toPersonData(person)
        }),
})
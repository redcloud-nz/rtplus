/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import z from 'zod'

import { TRPCError } from '@trpc/server'

// import { RTPlusLogger } from '@/lib/logger'

import { organizationSchema } from '@/lib/schemas/organization'
import { orgMembershipSchema, toOrgMembershipDataExtended } from '@/lib/schemas/org-membership'
import { PersonData, toPersonData } from '@/lib/schemas/person'

import { authenticatedProcedure, createTRPCRouter } from '../init'


// const logger = new RTPlusLogger('trpc/current-user')

export const currentUserRouter = createTRPCRouter({

    getMyOrgMembers: authenticatedProcedure
        .output(z.array(orgMembershipSchema.extend({ organization: organizationSchema })))
        .query(async ({ ctx }) => {
            const response = await ctx.clerkClient.users.getOrganizationMembershipList({ userId: ctx.auth.userId!, limit: 501 })

            return response.data.map(toOrgMembershipDataExtended)
        }),

    /**
     * Get the current user's person data.
     */
    getPerson: authenticatedProcedure
        .query(async ({ ctx }): Promise<PersonData> => {
            const person = await ctx.prisma.person.findUnique({ 
                where: { id: ctx.personId },
                
            })
            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: `Person with ID ${ctx.personId} not found.` })

            return toPersonData(person)
        }),
})
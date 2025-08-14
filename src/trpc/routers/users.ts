/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { organizationSchema } from '@/lib/schemas/organization'
import { orgMembershipSchema, toOrgMembershipDataExtended } from '@/lib/schemas/org-membership'
import { userSchema } from '@/lib/schemas/user'
import { zodNanoId8 } from '@/lib/validation'

import { createTRPCRouter, systemAdminProcedure } from '../init'

import { getTeamById } from './teams'
import { getPersonById } from './personnel'

/**
 * Router for managing organization memberships.
 * Provides methods to fetch memberships by person or team, and to update or delete memberships.
 */
export const usersRouter = createTRPCRouter({

    /**
     * Fetch all organization memberships for a specific person.
     * @param personId The ID of the person to fetch memberships for.
     * @returns An array of organization membership data.
     * @throws TRPCError if the person is not found or has no linked user.
     */
    byPerson: systemAdminProcedure
        .input(z.object({
            personId: zodNanoId8
        }))
        .output(z.array(orgMembershipSchema.extend({
            user: userSchema,
            organization: organizationSchema
        })))
        .query(async ({ ctx, input }) => {
            const person = await getPersonById(ctx, input.personId)
            if(!person.clerkUserId) throw new TRPCError({ code: 'BAD_REQUEST', message: `No linked user found for Person(${input.personId})`})

            const response = await ctx.clerkClient.users.getOrganizationMembershipList({ userId: person.clerkUserId, limit: 501 })

            return response.data.map(toOrgMembershipDataExtended)
        }),

    /**
     * Fetch all organization memberships for a specific team.
     * @param teamId The ID of the team to fetch memberships for.
     * @returns An array of organization membership data.
     * @throws TRPCError if the team is not found or the user is not an admin of the team.
     */
    byTeam: systemAdminProcedure
        .meta({ teamAdminRequired: true })
        .input(z.object({
            teamId: zodNanoId8
        }))
        .output(z.array(orgMembershipSchema.extend({
            user: userSchema,
            organization: organizationSchema
        })))
        .query(async ({ ctx, input }) => {
            const team = await getTeamById(ctx, input.teamId)
            
            const response = await ctx.clerkClient.organizations.getOrganizationMembershipList({ 
                organizationId: team.clerkOrgId, limit: 501
            })

            return response.data.map(toOrgMembershipDataExtended)
        }),

    /**
     * Delete an organization membership.
     * @param teamId The ID of the team to delete the membership from.
     * @param userId The ID of the user to delete the membership for.
     * @returns The deleted organization membership data.
     * @throws TRPCError if the team is not found or the user is not an admin of the team.
     */
    delete: systemAdminProcedure
        .meta({ teamAdminRequired: true })
        .input(z.object({
            teamId: zodNanoId8,
            userId: z.string().min(1, 'User ID is required'),
        }))
        .output(orgMembershipSchema.extend({
            user: userSchema,
            organization: organizationSchema
        }))
        .mutation(async ({ ctx, input }) => {
            const team = await getTeamById(ctx, input.teamId)

            const response = await ctx.clerkClient.organizations.deleteOrganizationMembership({
                organizationId: team.clerkOrgId,
                userId: input.userId,
            })

            return toOrgMembershipDataExtended(response)
        }),
        
    /**
     * Update an existing organization membership.
     * @param teamId The ID of the team to update the membership for.   
     * @param userId The ID of the user to update the membership for.
     * @param role The new role to assign to the user (either 'org:admin' or 'org:member').
     * @returns The updated organization membership data.
     * @throws TRPCError if the team is not found or the user is not an admin of the team.
     */
    update: systemAdminProcedure
        .meta({ teamAdminRequired: true })
        .input(z.object({
            teamId: zodNanoId8,
            userId: z.string().min(1, 'User ID is required'),
            role: z.enum(['org:admin', 'org:member']),
        }))
        .output(orgMembershipSchema.extend({
            user: userSchema,
            organization: organizationSchema
        }))
        .mutation(async ({ ctx, input }) => {
            const team = await getTeamById(ctx, input.teamId)

            const response = await ctx.clerkClient.organizations.updateOrganizationMembership({
                organizationId: team.clerkOrgId,
                userId: input.userId,
                role: input.role,
            })

            return toOrgMembershipDataExtended(response)
        }),
})
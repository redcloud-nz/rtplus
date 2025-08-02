/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { orgMembershipSchema, toOrgMembershipData } from '@/lib/schemas/org-membership'
import { createUserData, userSchema, userSchema2 } from '@/lib/schemas/user'
import { zodNanoId8 } from '@/lib/validation'

import { createTRPCRouter, teamAdminProcedure } from '../../init'
import { getActiveTeam } from '../teams'
import { getPersonById } from '../personnel'


export const activeTeamUsersRouter = createTRPCRouter({

    /**
     * Fetch all the users in the active team.
     * @param ctx The authenticated context.
     * @returns An array of organization membership data with user details.
     */
    all: teamAdminProcedure
        .output(z.array(userSchema2))
        .query(async ({ ctx }) => {

            const { data: orgMemberships } = await ctx.clerkClient.organizations.getOrganizationMembershipList({ organizationId: ctx.orgId, limit: 100 })
            const userIds = orgMemberships.map(m => m.publicUserData!.userId)

            const { data: users } = await ctx.clerkClient.users.getUserList({ userId: userIds, limit: 100 })

            const result = orgMemberships.map(membership => {
                const user = users.find(u => u.id === membership.publicUserData!.userId)!
                
                return createUserData(user, membership)
            })

            return result
        }),

    /**
     * Fetch a specific user in the active team by person ID.
     * @param ctx The authenticated context.
     * @param input The input containing the person ID.
     * @returns The user data if found, or null if the person is not linked to a user.
     */
    byPerson: teamAdminProcedure
        .input(z.object({
            personId: zodNanoId8
        }))
        .output(userSchema2.nullable())
        .query(async ({ ctx, input }) => {

            const person = await getPersonById(ctx, input.personId)
            if (!person.clerkUserId) return null
            

            const [{ data: [membership] }, user] = await Promise.all([
                ctx.clerkClient.organizations.getOrganizationMembershipList({ userId: [person.clerkUserId], organizationId: ctx.orgId, limit: 1 }),
                ctx.clerkClient.users.getUser(person.clerkUserId)
            ])

            return createUserData(user, membership)
        }),

    /**
     * Create a new user in the active team.
     * @param ctx The authenticated context.
     * @param input The input containing the person ID and role.
     * @returns The created user data.
     * @throws TRPCError(BAD_REQUEST) if the person is not linked to a user.
     */
    create: teamAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
            role: z.enum(['org:admin', 'org:member']),
        }))
        .output(userSchema2)
        .mutation(async ({ ctx, input }) => {
            const person = await getPersonById(ctx, input.personId)
            if (!person.clerkUserId) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: `Person(${input.personId}) is not linked to a user.` })
            }
            const team = await getActiveTeam(ctx)
        
            const user = await ctx.clerkClient.users.getUser(person.clerkUserId)

            // Create the organization membership
            const membership = await ctx.clerkClient.organizations.createOrganizationMembership({
                organizationId: team.clerkOrgId,
                userId: person.clerkUserId,
                role: input.role,
            })

            return createUserData(user, membership)
        }),

    /**
     * Delete a user from the active team.
     * @param ctx The authenticated context.
     * @param input The input containing the person ID to remove.
     * @returns The deleted organization membership data with user details.
     * @throws TRPCError(NOT_FOUND) if the membership doesn't exist or the person is not linked to a user.
     */
    delete: teamAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
        }))
        .output(userSchema2)
        .mutation(async ({ ctx, input }) => {

            const [team, person] = await Promise.all([
                getActiveTeam(ctx),
                getPersonById(ctx, input.personId)
            ])

            if(!person.clerkUserId ) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Person(${input.personId}) is not linked to a user.` })
            }

            const user = await ctx.clerkClient.users.getUser(person.clerkUserId)

            // Revoke the membership
            const membership = await ctx.clerkClient.organizations.deleteOrganizationMembership({
                organizationId: team.clerkOrgId,
                userId: person.clerkUserId
            })

            return createUserData(user, membership)
        }),

    /**
     * Update a user's role in the active team.
     * @param ctx The authenticated context.
     * @param input The input containing the person ID and new role.
     * @returns The updated user data.
     * @throws TRPCError(BAD_REQUEST) if the person is not linked to a user.
     * @throws TRPCError(NOT_FOUND) if the membership doesn't exist.
     */
    update: teamAdminProcedure
        .input(z.object({
            personId: zodNanoId8,
            role: z.enum(['org:admin', 'org:member']),
        }))
        .output(orgMembershipSchema.extend({
            user: userSchema,
        }))
        .mutation(async ({ ctx, input }) => {
            const [team, person] = await Promise.all([
                getActiveTeam(ctx),
                getPersonById(ctx, input.personId)
            ])
            if(!person.clerkUserId ) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Person(${input.personId}) is not linked to a user.` })
            }


            // Update the organization membership
            const response = await ctx.clerkClient.organizations.updateOrganizationMembership({
                organizationId: team.clerkOrgId,
                userId: person.clerkUserId,
                role: input.role,
            })

            return toOrgMembershipData(response)
        }),
})
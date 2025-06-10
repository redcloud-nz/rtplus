/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick } from 'remeda'
import { z } from 'zod'

import { OrganizationMembership } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'

import { orgMembershipFormSchema } from '@/lib/forms/org-membership'
import { zodNanoId8 } from '@/lib/validation'

import { createTRPCRouter, systemAdminProcedure, teamAdminProcedure } from '../init'
import { OrgMembershipBasic } from '../types'

import { getTeamById } from './teams'
import { getPersonById } from './personnel'



export const orgMembershipsRouter = createTRPCRouter({

    byPerson: systemAdminProcedure
        .input(z.object({
            personId: zodNanoId8
        }))
        .query(async ({ ctx, input }): Promise<OrgMembershipBasic[]> => {
            const person = await getPersonById(ctx, input.personId)
            if(!person.clerkUserId) throw new TRPCError({ code: 'BAD_REQUEST', message: `No linked user found for Person(${input.personId})`})

            const response = await ctx.clerkClient.users.getOrganizationMembershipList({ userId: person.clerkUserId, limit: 501 })

            return response.data.map(toOrgMembershipBasic)
        }),
    byCurrentTeam: teamAdminProcedure
        .query(async ({ ctx }): Promise<OrgMembershipBasic[]> => {
            
            const response = await ctx.clerkClient.organizations.getOrganizationMembershipList({ organizationId: ctx.orgId, limit: 501 })

            return response.data.map(toOrgMembershipBasic)
        }),

    byTeam: systemAdminProcedure
        .input(z.object({
            teamId: zodNanoId8
        }))
        .query(async ({ ctx, input }): Promise<OrgMembershipBasic[]> => {
            const team = await getTeamById(ctx, input.teamId)
            
            const response = await ctx.clerkClient.organizations.getOrganizationMembershipList({ organizationId: team.clerkOrgId, limit: 501 })

            return response.data.map(toOrgMembershipBasic)
        }),

    delete: teamAdminProcedure
        .input(z.object({
            userId: z.string().min(1, 'User ID is required'),
        }))
        .mutation(async ({ ctx, input }) => {

            const response = await ctx.clerkClient.organizations.deleteOrganizationMembership({
                organizationId: ctx.orgId,
                userId: input.userId,
            })

            return toOrgMembershipBasic(response)
        }),
            
    update: teamAdminProcedure
        .input(orgMembershipFormSchema)
        .mutation(async ({ ctx, input }) => {

            const response = await ctx.clerkClient.organizations.updateOrganizationMembership({
                organizationId: ctx.orgId,
                userId: input.userId,
                role: input.role,
            })

            return toOrgMembershipBasic(response)
        }),
})



function toOrgMembershipBasic(orgMembership: OrganizationMembership): OrgMembershipBasic {
    return {
        id: orgMembership.id,
        role: orgMembership.role,
        user: {
            id: orgMembership.publicUserData?.userId || '',
            identifier: orgMembership.publicUserData?.identifier || '',
            name: `${orgMembership.publicUserData?.firstName || ''} ${orgMembership.publicUserData?.lastName || ''}`.trim() || "Unknown User",
        },
        organization: pick(orgMembership.organization, ['id', 'name', 'slug']),
        createdAt: orgMembership.createdAt,
        updatedAt: orgMembership.updatedAt,
    }
}
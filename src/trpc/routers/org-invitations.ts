/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { OrganizationInvitation as ClerkOrganizationInvitation } from '@clerk/nextjs/server'

import { OrgInvitationData, orgInvitationSchema } from '@/lib/schemas/org-invitation'
import { zodNanoId8 } from '@/lib/validation'

import { authenticatedProcedure, createTRPCRouter } from '../init'
import { getTeamById } from './teams'

/**
 * Router for managing organization invitations.
 * Provides methods to fetch, create, and revoke invitations for a specific team.
 */
export const orgInvitationsRouter = createTRPCRouter({
    
    /**
     * Fetch all pending invitations for a specific team.
     * @param teamId The ID of the team to fetch invitations for.
     * @returns An array of organization invitation data.
     * @throws TRPCError if the team is not found or the user is not an admin of the team.
     */
    byTeam: authenticatedProcedure
        .meta({ teamAdminRequired: true })
        .input(z.object({
            teamId: zodNanoId8,
        }))
        .output(z.array(orgInvitationSchema))
        .query(async ({ ctx, input: { teamId } }) => {
            const team = await getTeamById(ctx, teamId)
            ctx.requireTeamAdmin(team.clerkOrgId)

            const response = await ctx.clerkClient.organizations.getOrganizationInvitationList({ organizationId: team.clerkOrgId, limit: 501, status: ['pending'] })

            return response.data.map(toOrgInvitationData)
        }),

    /**
     * Create a new organization invitation for a specific team.
     * @param teamId The ID of the team to create the invitation for.
     * @param email The email address to invite.
     * @param role The role to assign to the invited user (either 'org:admin' or 'org:member').
     * @returns The created organization invitation data.
     * @throws TRPCError if the team is not found or the user is not an admin of the team.
     */
    create: authenticatedProcedure
        .meta({ teamAdminRequired: true })
        .input(z.object({
            teamId: zodNanoId8,
            email: z.string().email('Invalid email address'),
            role: z.enum(['org:admin', 'org:member']),
        }))
        .output(orgInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await getTeamById(ctx, input.teamId)
            ctx.requireTeamAdmin(team.clerkOrgId)

            const response = await ctx.clerkClient.organizations.createOrganizationInvitation({
                organizationId: team.clerkOrgId,
                inviterUserId: ctx.auth.userId,
                emailAddress: input.email,
                role: input.role,
            })

            return toOrgInvitationData(response)
        }),
        
    /**
     * Revoke an existing organization invitation.
     * @param teamId The ID of the team to revoke the invitation from.
     * @param invitationId The ID of the invitation to revoke.
     * @returns The revoked organization invitation data.
     * @throws TRPCError if the team is not found or the user is not an admin of the team.
     */
    revoke: authenticatedProcedure
        .meta({ teamAdminRequired: true })
        .input(z.object({
            teamId: zodNanoId8,
            invitationId: z.string().min(1, 'Invitation ID is required'),
        }))
        .output(orgInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            const team = await getTeamById(ctx, input.teamId)
            ctx.requireTeamAdmin(team.clerkOrgId)

            const response = await ctx.clerkClient.organizations.revokeOrganizationInvitation({
                organizationId: team.clerkOrgId,
                invitationId: input.invitationId,
                requestingUserId: ctx.auth.userId,
            })

            return toOrgInvitationData(response)
        }),
})

/**
 * Converts a Clerk Organization Invitation to the internal OrgInvitationData format.
 * @param invite The Clerk Organization Invitation to convert.
 * @returns The converted OrgInvitationData.
 */
function toOrgInvitationData(invite: ClerkOrganizationInvitation): OrgInvitationData {
    return {
        invitationId: invite.id,
        email: invite.emailAddress,
        role: invite.role as 'org:admin' | 'org:member',
        createdAt: invite.createdAt,
        updatedAt: invite.updatedAt,
    }
}

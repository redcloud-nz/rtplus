/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { teamInvitationSchema, toTeamInvitationData } from '@/lib/schemas/invitation'

import { createTRPCRouter, teamAdminProcedure } from '../../init'

export const activeTeamInvitationsRouter = createTRPCRouter({

    /**
     * Fetch all invitations for the active team.
     * @param ctx The authenticated context.
     * @param input Optional input to filter invitations by status.
     * @param input.status An array of invitation statuses to filter by (default is ['pending']).
     * @returns An array of organization invitation data.
     */
    all: teamAdminProcedure
        .input(z.object({
            status: z.array(z.enum(['pending', 'accepted', 'revoked', 'expired'])).min(1).max(4).optional().default(['pending'])
        }))
        .output(z.array(teamInvitationSchema))
        .query(async ({ ctx, input }) => {

            const { data: orgInvitations } = await ctx.clerkClient.organizations.getOrganizationInvitationList({ organizationId: ctx.orgId, limit: 100, status: input?.status })

            return orgInvitations.map(toTeamInvitationData)
        }),

    /**
     * Create a new organization invitation for the active team.
     * @param ctx The authenticated context.
     * @param input The input containing the email and role for the invitation.
     * @param input.email The email address to invite.
     * @param input.role The role of the invited user (org:admin or org:member).
     * @returns The created organization invitation data.
     * @throws TRPCError(BAD_REQUEST) If an invitation for the email already exists.
     */
    create: teamAdminProcedure
        .input(teamInvitationSchema.pick({ email: true, role: true }))
        .output(teamInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            // See if there is a person with this email
            const person = await ctx.prisma.person.findUnique({ where: { email: input.email }})

            const { data: existingInvitations } = await ctx.clerkClient.organizations.getOrganizationInvitationList({ organizationId: ctx.orgId, status: ['pending'] })
            if (existingInvitations.some(inv => inv.emailAddress === input.email)) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: `An invitation for ${input.email} already exists.` })
            }

            const orgInvitation = await ctx.clerkClient.organizations.createOrganizationInvitation({
                organizationId: ctx.orgId,
                inviterUserId: ctx.auth.userId,
                emailAddress: input.email,
                role: input.role,
                publicMetadata: {
                    personId: person?.id || null,
                },
            })

            return toTeamInvitationData(orgInvitation)
        }),

    resend: teamAdminProcedure
        .input(z.object({
            invitationId: z.string()
        }))
        .output(teamInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            const orgInvitation = await ctx.clerkClient.organizations.getOrganizationInvitation({ organizationId: ctx.orgId, invitationId: input.invitationId })
            if (!orgInvitation) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Invitation with ID ${input.invitationId} not found.` })
            }
            if(orgInvitation.status != 'pending') {
                throw new TRPCError({ code: 'BAD_REQUEST', message: `Invitation with ID ${input.invitationId} is not pending.` })
            }
            
            // Revoke the existing invitation
            await ctx.clerkClient.organizations.revokeOrganizationInvitation({ organizationId: ctx.orgId, invitationId: input.invitationId })

            // Create a new invitation with the same email and role
            // This will send a new email to the user
            const newInvitation = await ctx.clerkClient.organizations.createOrganizationInvitation({
                organizationId: ctx.orgId,
                inviterUserId: ctx.auth.userId,
                emailAddress: orgInvitation.emailAddress,
                role: orgInvitation.role,
                publicMetadata: orgInvitation.publicMetadata,
             })

            return toTeamInvitationData(newInvitation)
        }),

    /**
     * Revoke an existing organization invitation.
     * @param ctx The authenticated context.
     * @param input The input containing the invitation ID to revoke.
     * @param input.invitationId The ID of the invitation to revoke.
     * @returns The revoked organization invitation data.
     * @throws TRPCError(NOT_FOUND) If the invitation with the given ID does not exist.
     */
    revoke: teamAdminProcedure
        .input(z.object({
            invitationId: z.string()
        }))
        .output(teamInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            const orgInvitation = await ctx.clerkClient.organizations.getOrganizationInvitation({ organizationId: ctx.orgId, invitationId: input.invitationId })
            if (!orgInvitation) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Invitation with ID ${input.invitationId} not found.` })
            }


            const revokedInvitation = await ctx.clerkClient.organizations.revokeOrganizationInvitation({ organizationId: ctx.orgId, invitationId: input.invitationId })

            return toTeamInvitationData(revokedInvitation)
        })
})
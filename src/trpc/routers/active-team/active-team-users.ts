/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { teamInvitationSchema, toTeamInvitationData } from '@/lib/schemas/invitation'
import { orgMembershipSchema, toOrgMembershipData } from '@/lib/schemas/org-membership'
import { toUserData, userSchema, userSchema2 } from '@/lib/schemas/user'
import { zodNanoId8 } from '@/lib/validation'
import { createTRPCRouter, teamAdminProcedure } from '@/trpc/init'

import { getActiveTeam } from '../teams'
import { getPersonById } from '../personnel'



export const activeTeamUsersRouter = createTRPCRouter({

    /**
     * Create a new organization invitation for the active team.
     * @param ctx The authenticated context.
     * @param input The input containing the email and role for the invitation.
     * @param input.email The email address to invite.
     * @param input.role The role of the invited user (org:admin or org:member).
     * @returns The created organization invitation data.
     * @throws TRPCError(BAD_REQUEST) If an invitation for the email already exists.
     */
    createInvitation: teamAdminProcedure
        .input(teamInvitationSchema.pick({ email: true, role: true }))
        .output(teamInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            // See if there is a person with this email
            const person = await ctx.prisma.person.findUnique({ where: { email: input.email }})

            const { data: existingInvitations } = await ctx.clerkClient.organizations.getOrganizationInvitationList({ organizationId: ctx.session.activeTeam.orgId, status: ['pending'] })
            if (existingInvitations.some(inv => inv.emailAddress === input.email)) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: `An invitation for ${input.email} already exists.` })
            }

            const orgInvitation = await ctx.clerkClient.organizations.createOrganizationInvitation({
                organizationId: ctx.session.activeTeam.orgId,
                inviterUserId: ctx.session.userId,
                emailAddress: input.email,
                role: input.role,
                publicMetadata: {
                    personId: person?.id || null,
                },
            })

            return toTeamInvitationData(orgInvitation)
        }),

    /**
     * Create a new user in the active team.
     * @param ctx The authenticated context.
     * @param input The input containing the person ID and role.
     * @returns The created user data.
     * @throws TRPCError(BAD_REQUEST) if the person is not linked to a user.
     */
    createUser: teamAdminProcedure
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

            return toUserData(user, membership)
        }),

    /**
     * Delete a user from the active team.
     * @param ctx The authenticated context.
     * @param input The input containing the person ID to remove.
     * @returns The deleted organization membership data with user details.
     * @throws TRPCError(NOT_FOUND) if the membership doesn't exist or the person is not linked to a user.
     */
    deleteUser: teamAdminProcedure
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

            return toUserData(user, membership)
        }),

    /**
     * Fetch all invitations for the active team.
     * @param ctx The authenticated context.
     * @param input Optional input to filter invitations by status.
     * @param input.status An array of invitation statuses to filter by (default is ['pending']).
     * @returns An array of organization invitation data.
     */
    getInvitations: teamAdminProcedure
        .input(z.object({
            status: z.array(z.enum(['pending', 'accepted', 'revoked', 'expired'])).min(1).max(4).optional().default(['pending'])
        }))
        .output(z.array(teamInvitationSchema))
        .query(async ({ ctx, input }) => {

            const { data: orgInvitations } = await ctx.clerkClient.organizations.getOrganizationInvitationList({ organizationId: ctx.session.activeTeam.orgId, limit: 100, status: input?.status })

            return orgInvitations.map(toTeamInvitationData)
        }),

    /**
     * Fetch a specific user in the active team by person ID.
     * @param ctx The authenticated context.
     * @param input The input containing the person ID.
     * @returns The user data if found, or null if the person is not linked to a user.
     */
    getUser: teamAdminProcedure
        .input(z.object({
            personId: zodNanoId8
        }))
        .output(userSchema2.nullable())
        .query(async ({ ctx, input }) => {

            const person = await getPersonById(ctx, input.personId)
            if (!person.clerkUserId) return null
            

            const [{ data: [membership] }, user] = await Promise.all([
                ctx.clerkClient.organizations.getOrganizationMembershipList({ userId: [person.clerkUserId], organizationId: ctx.session.activeTeam.orgId, limit: 1 }),
                ctx.clerkClient.users.getUser(person.clerkUserId)
            ])

            return toUserData(user, membership)
        }),

    /**
     * Fetch all the users in the active team.
     * @param ctx The authenticated context.
     * @returns An array of organization membership data with user details.
     */
    getUsers: teamAdminProcedure
        .output(z.array(userSchema2))
        .query(async ({ ctx }) => {

            const { data: orgMemberships } = await ctx.clerkClient.organizations.getOrganizationMembershipList({ organizationId: ctx.session.activeTeam.orgId, limit: 100 })
            const userIds = orgMemberships.map(m => m.publicUserData!.userId)

            const { data: users } = await ctx.clerkClient.users.getUserList({ userId: userIds, limit: 100 })

            const result = orgMemberships.map(membership => {
                const user = users.find(u => u.id === membership.publicUserData!.userId)!
                
                return toUserData(user, membership)
            })

            return result
        }),

    /**
     * Resend an existing organization invitation.
     * @param ctx The authenticated context.
     * @param input The input containing the invitation ID to resend.
     * @returns The resent organization invitation data.
     * @throws TRPCError(NOT_FOUND) If the invitation with the given ID does not exist.
     * @throws TRPCError(BAD_REQUEST) If the invitation is not in the 'pending' status.
     */
    resendInvitation: teamAdminProcedure
        .input(z.object({
            invitationId: z.string()
        }))
        .output(teamInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            const orgInvitation = await ctx.clerkClient.organizations.getOrganizationInvitation({ organizationId: ctx.session.activeTeam.orgId, invitationId: input.invitationId })
            if (!orgInvitation) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Invitation with ID ${input.invitationId} not found.` })
            }
            if(orgInvitation.status != 'pending') {
                throw new TRPCError({ code: 'BAD_REQUEST', message: `Invitation with ID ${input.invitationId} is not pending.` })
            }
            
            // Revoke the existing invitation
            await ctx.clerkClient.organizations.revokeOrganizationInvitation({ organizationId: ctx.session.activeTeam.orgId, invitationId: input.invitationId })

            // Create a new invitation with the same email and role
            // This will send a new email to the user
            const newInvitation = await ctx.clerkClient.organizations.createOrganizationInvitation({
                organizationId: ctx.session.activeTeam.orgId,
                inviterUserId: ctx.session.userId,
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
    revokeInvitation: teamAdminProcedure
        .input(z.object({
            invitationId: z.string()
        }))
        .output(teamInvitationSchema)
        .mutation(async ({ ctx, input }) => {
            const orgInvitation = await ctx.clerkClient.organizations.getOrganizationInvitation({ organizationId: ctx.session.activeTeam.orgId, invitationId: input.invitationId })
            if (!orgInvitation) {
                throw new TRPCError({ code: 'NOT_FOUND', message: `Invitation with ID ${input.invitationId} not found.` })
            }


            const revokedInvitation = await ctx.clerkClient.organizations.revokeOrganizationInvitation({ organizationId: ctx.session.activeTeam.orgId, invitationId: input.invitationId })

            return toTeamInvitationData(revokedInvitation)
        }),

    /**
     * Update a user's role in the active team.
     * @param ctx The authenticated context.
     * @param input The input containing the person ID and new role.
     * @returns The updated user data.
     * @throws TRPCError(BAD_REQUEST) if the person is not linked to a user.
     * @throws TRPCError(NOT_FOUND) if the membership doesn't exist.
     */
    updateUser: teamAdminProcedure
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
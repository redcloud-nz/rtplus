/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { organizationSettingsSchema, userSettingsSchema } from '@/lib/schemas/settings'
import { authenticatedProcedure, createTRPCRouter, orgAdminProcedure, orgProcedure } from '../init'
import { RTPlusLogger } from '@/lib/logger'
import { revalidateOrganization } from '@/server/organization'

const logger = new RTPlusLogger('trpc/settings')

export const settingsRouter = createTRPCRouter({

    getUserSettings: authenticatedProcedure
        .output(userSettingsSchema)
        .query(async ({ ctx }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { userId: ctx.auth.userId },
            })

            if(!user) logger.warn('User not found', { userId: ctx.auth.userId })

            return userSettingsSchema.parse(user?.settings || {})
        }),

    getOrganizationSettings: orgProcedure
        .output(organizationSettingsSchema)
        .query(async ({ ctx, input }) => {
            const org = await ctx.prisma.organization.findUnique({
                where: { orgId: input.orgId },
            })

            if(!org) logger.warn('Organization not found', { orgId: input.orgId })

            return organizationSettingsSchema.parse(org?.settings || {})
        }),

    updateOrganizationSettings: orgAdminProcedure
        .input(organizationSettingsSchema.partial())
        .mutation(async ({ ctx, input }) => {

            const org = await ctx.prisma.organization.update({
                where: { orgId: input.orgId },
                data: { 
                    settings: { ...input }
                },
            })

            if(!org) logger.warn('Organization not found', { orgId: input.orgId })

            revalidateOrganization(ctx.auth.activeOrg.orgSlug)

            return organizationSettingsSchema.parse(org?.settings || {})
        })
})
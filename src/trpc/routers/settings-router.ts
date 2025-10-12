/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { organizationSettingsSchema, userSettingsSchema } from '@/lib/schemas/settings'
import { authenticatedProcedure, createTRPCRouter, orgProcedure } from '../init'
import { RTPlusLogger } from '@/lib/logger'

const logger = new RTPlusLogger('trpc/settings')

export const settingsRouter = createTRPCRouter({

    getUserSessions: authenticatedProcedure
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
        .query(async ({ ctx }) => {
            const org = await ctx.prisma.organization.findUnique({
                where: { orgId: ctx.auth.activeOrg.orgId },
            })

            if(!org) logger.warn('Organization not found', { orgId: ctx.auth.activeOrg.orgId })

            return organizationSettingsSchema.parse(org?.settings || {})
        }),
})
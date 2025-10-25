/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { type Organization as ClerkOrganization } from '@clerk/nextjs/server'
import { type Organization as OrganizationRecord } from '@prisma/client'

import { organizationSettingsSchema } from './settings'

export type OrganizationId = string & z.BRAND<'OrganizationId'>

export const OrganizationId = {
    schema: z.string().startsWith('org_').min(6).max(50).brand<'OrganizationId'>(),
}

export const organizationSchema = z.object({
    orgId: OrganizationId.schema,
    slug: z.string().min(3).max(50),
    name: z.string().min(3).max(100),
    settings: organizationSettingsSchema,
})

export function toOrganizationData(record: OrganizationRecord, clerkOrganization: ClerkOrganization): OrganizationData {
    return organizationSchema.parse({
        orgId: record.orgId,
        slug: clerkOrganization.slug,
        name: clerkOrganization.name,
        settings: organizationSettingsSchema.parse(record.settings),
    })
}

export type OrganizationData = z.infer<typeof organizationSchema>


export function isModuleEnabled(organization: OrganizationData, module: keyof OrganizationData['settings']['modules']): boolean {
    const modules = organization.settings.modules || {}
    return modules[module]?.enabled === true
}

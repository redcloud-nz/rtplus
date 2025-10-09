/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'


import { Organization as OrganizationRecord } from '@prisma/client'

export type OrganizationId = string & z.BRAND<'OrganizationId'>

export const OrganizationId = {
    schema: z.string().startsWith('org_').min(6).max(50).brand<'OrganizationId'>(),
}

export const organizationSchema = z.object({
    orgId: OrganizationId.schema,
    name: z.string().min(3).max(100),
    settings: z.record(z.any()),
})

export function toOrganizationData(record: OrganizationRecord) {
    return organizationSchema.parse(record)
}

export type OrganizationData = z.infer<typeof organizationSchema>

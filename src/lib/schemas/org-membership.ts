/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { z } from 'zod'

export const orgMembershipSchema = z.object({
    orgMembershipId: z.string(),
    userId: z.string(),
    organizationId: z.string(),
    role: z.enum(['org:admin', 'org:member']),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type OrgMembershipData = z.infer<typeof orgMembershipSchema>
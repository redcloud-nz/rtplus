/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { z } from 'zod'

export const orgInvitationSchema = z.object({
    invitationId: z.string(),
    email: z.string().email('Invalid email address'),
    role: z.enum(['org:admin', 'org:member']),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type OrgInvitationData = z.infer<typeof orgInvitationSchema>
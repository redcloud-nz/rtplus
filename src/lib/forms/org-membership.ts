/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { z } from 'zod'

export const orgMembershipFormSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    role: z.enum(['org:admin', 'org:member'])
})

export type OrgMembershipFormData = z.infer<typeof orgMembershipFormSchema>
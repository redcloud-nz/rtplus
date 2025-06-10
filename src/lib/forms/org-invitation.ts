/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { z } from 'zod'

export const orgInvitationFormSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['org:admin', 'org:member'])
})

export type OrgInvitationFormData = z.infer<typeof orgInvitationFormSchema>
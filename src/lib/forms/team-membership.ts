/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'


export const teamMembershipFormSchema = z.object({
    teamId: z.string().uuid(),
    personId: z.string().uuid(),
    role: z.enum(['Admin', 'Member', 'None'])
})

export type TeamMembershipFormData = z.infer<typeof teamMembershipFormSchema>
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { zodNanoId8 } from '../validation'

export const addTeamMemberFormSchema = z.object({
    existingPersonId: zodNanoId8.optional(),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email(),
    role: z.enum(['None', 'Member', 'Admin']),
})
export type AddTeamMemberFormSchema = z.infer<typeof addTeamMemberFormSchema>
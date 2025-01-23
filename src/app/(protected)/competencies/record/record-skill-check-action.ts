/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/record
 */
'use server'

import { FormState } from '@/lib/form-state'
import { z } from 'zod'

import { auth } from '@clerk/nextjs/server'


const RecordSkillCheckFormSchema = z.object({
    skillId: z.string().uuid(),
    assesseeId: z.string().uuid(),
    competenceLevel: z.enum(['NotTaught', 'NotCompetent', 'Competent', 'HighlyConfident']),
    notes: z.string().max(1000),
})

export async function recordSkillCheckAction(formState: FormState, formData: FormData): Promise<FormState> {
    

    const { userId, sessionClaims: { personId: assessorId } } = await auth.protect()

    return formState
}
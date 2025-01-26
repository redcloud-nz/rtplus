/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { authenticated } from '@/lib/auth'
import { FormState, fromErrorToFormState } from '@/lib/form-state'
import prisma from '@/lib/prisma'

import * as Paths from '@/paths'


const RecordSkillCheckFormSchema = z.object({
    skillId: z.string().uuid(),
    assesseeId: z.string().uuid(),
    competenceLevel: z.enum(['NotTaught', 'NotCompetent', 'Competent', 'HighlyConfident']),
    notes: z.string().max(1000),
})

export async function recordSkillCheckAction(formState: FormState, formData: FormData): Promise<FormState> {
    
    const { userPersonId } = await authenticated()

    try {
        const fields = RecordSkillCheckFormSchema.parse(Object.entries(formData))

        await prisma.skillCheck.create({
            data: {
                skillId: fields.skillId,
                assesseeId: fields.assesseeId,
                assessorId: userPersonId,
                competenceLevel: fields.competenceLevel,
                notes: fields.notes,
            }
        })
    } catch(error) {
        return fromErrorToFormState(error)
    }

    redirect(Paths.competencies.dashboard)
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { SkillCheck as SkillCheckRecord } from '@prisma/client'
import { zodNanoId16, zodNanoId8 } from '../validation'


export const skillCheckSchema = z.object({
    skillCheckId: zodNanoId16,
    sessionId: zodNanoId8.nullable(),
    skillId: zodNanoId8,
    assesseeId: zodNanoId8,
    assessorId: zodNanoId8,
    result: z.string().nonempty(),
    notes: z.string().max(500),
    date: z.string().date(),
})

export type SkillCheckData = z.infer<typeof skillCheckSchema>

export function toSkillCheckData(record: SkillCheckRecord): SkillCheckData {
    return {
        skillCheckId: record.id,
        sessionId: record.sessionId,
        skillId: record.skillId,
        assesseeId: record.assesseeId,
        assessorId: record.assessorId,
        result: record.result,
        notes: record.notes,
        date: record.date,
    }
}

export const skillCheckDetailSchema = skillCheckSchema.extend({
    skillName: z.string().max(100),
    assesseeName: z.string().max(100),
    assessorName: z.string().max(100),
})

export type SkillCheckDetailData = z.infer<typeof skillCheckDetailSchema>

export type CompetenceLevel = 'NotAssessed' | 'NotTaught' | 'NotCompetent' | 'Competent' | 'HighlyConfident'

export const CompetenceLevelTerms: Record<CompetenceLevel, string> = {
    'NotAssessed': 'Not Assessed',
    'NotTaught': 'Not Taught',
    'NotCompetent': 'Not Competent',
    'Competent': 'Competent',
    'HighlyConfident': 'Highly Confident',
}

export const CompetenceLevelDescriptions: Record<CompetenceLevel, string> = {
    'NotAssessed': 'This skill has not yet been assessed.',
    'NotTaught': 'Training not complete for skill.',
    'NotCompetent': 'Unable to complete or required assistance.',
    'Competent': 'Able to complete unassisted.',
    'HighlyConfident': 'Able to complete unassisted and teach others.',
}
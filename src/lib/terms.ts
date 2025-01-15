
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { CompetenceLevel } from "@prisma/client"

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
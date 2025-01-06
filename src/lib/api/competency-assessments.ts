/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { CompetencyAssessment } from '@prisma/client'



export interface CompetencyAssessmentWithRelations extends CompetencyAssessment {
    assesseeIds: string[]
    skillIds: string[]
}
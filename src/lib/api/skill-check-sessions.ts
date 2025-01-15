/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { SkillCheckSession } from '@prisma/client'


export interface SkillCheckSessionWithRelations extends SkillCheckSession{
    assesseeIds: string[]
    skillIds: string[]
}
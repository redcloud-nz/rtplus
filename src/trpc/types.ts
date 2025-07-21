/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { SkillCheckSession as SkillCheckSessionRecord } from '@prisma/client'


export type DeleteType = 'Soft' | 'Hard'

export class FieldConflictError extends Error {
    constructor(fieldName: string) {
        super(fieldName)
        this.name = 'FieldConflictError'
    }
}


export interface PersonAccess {

}

export type SkillCheckSessionWithCounts = WithCounts<SkillCheckSessionRecord, 'assessees' | 'checks' | 'skills'>



export type WithCounts<T, S extends string> = T & { _count: Record<S, number> }
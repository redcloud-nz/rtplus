/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import type { SkillCheck, SkillCheckSession } from '@prisma/client'

import type { WithSerializedDates } from '@/lib/serialize'


export type SkillCheck_Client = WithSerializedDates<Omit<SkillCheck, 'userId' | 'sessionId' | 'assessorId'>>
export type SkillCheckSession_Client = WithSerializedDates<Omit<SkillCheckSession, 'userId' | 'createdAt' | 'updatedAt'>>

export type SkillCheckDiff = 
    { type: 'UPDATE_SESSION', session: SkillCheckSession_Client } | 
    { type: 'ADD_ASSESSEE', assesseeId: string } | 
    { type: 'REMOVE_ASSESSEE', assesseeId: string } | 
    { type: 'ADD_SKILL', skillId: string } | 
    { type: 'REMOVE_SKILL', skillId: string } | 
    { type: 'UPDATE_CHECK', check: SkillCheck_Client }


export function appendDiff(existingDiffs: SkillCheckDiff[], newDiff: SkillCheckDiff): SkillCheckDiff[] {
    switch(newDiff.type) {
        case 'UPDATE_SESSION':
            return [...existingDiffs.filter(diff => diff.type != 'UPDATE_SESSION'), newDiff]
        case 'ADD_ASSESSEE': {
            const filtered = existingDiffs.filter(diff => diff.type != 'REMOVE_ASSESSEE' || diff.assesseeId != newDiff.assesseeId)
            return filtered.length == existingDiffs.length ? [...existingDiffs, newDiff] : filtered
        }
        case 'REMOVE_ASSESSEE': {
            const filtered = existingDiffs.filter(diff => diff.type != 'ADD_ASSESSEE' || diff.assesseeId != newDiff.assesseeId)
            return filtered.length == existingDiffs.length ? [...existingDiffs, newDiff] : filtered
        }
        case 'ADD_SKILL': {
            const filtered = existingDiffs.filter(diff => diff.type != 'REMOVE_SKILL' || diff.skillId != newDiff.skillId)
            return filtered.length == existingDiffs.length ? [...existingDiffs, newDiff] : filtered
        }
        case 'REMOVE_SKILL': {
            const filtered = existingDiffs.filter(diff => diff.type != 'ADD_SKILL' || diff.skillId != newDiff.skillId)
            return filtered.length == existingDiffs.length ? [...existingDiffs, newDiff] : filtered
        }
        case 'UPDATE_CHECK': {
            return [...existingDiffs.filter(diff => diff.type != 'UPDATE_CHECK' || diff.check.id != newDiff.check.id), newDiff]
        }
    }
}
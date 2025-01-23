/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as React from 'react'
import * as R from 'remeda'
import { create } from 'zustand'

import { createUUID } from '@/lib/id'

import { appendDiff, SkillCheck_Client, SkillCheckDiff, SkillCheckSession_Client } from './skill-check-data'
import { saveSessionAction } from './save-session-action'
import { assertNonNull } from '@/lib/utils'

/**
 * Store for the current competency assessment.
 */
export interface SkillCheckStore {
    // Data
    status: 'Loading' | 'Ready' | 'Saving' | 'Saved'
    session?: SkillCheckSession_Client
    assesseeIds: string[]
    skillIds: string[]
    checks: Record<string, SkillCheck_Client>
    changeCount: number

    // Actions
    init(data: SkillCheckStoreInitData): void
    
    updateSession(partial: SkillCheckSession_Client): void
    addAssessee(assesseeId: string): void
    removeAssessee(assesseeId: string): void
    addSkill(skillId: string): void
    removeSkill(skillId: string): void

    updateSkillCheck(check: SkillCheck_Client): void
    save(): Promise<void>

    _diffs: SkillCheckDiff[]
}

type SkillCheckStoreInitData = Required<Pick<SkillCheckStore, 'session' | 'assesseeIds' | 'skillIds' | 'checks'>>

export const useSkillCheckStore = create<SkillCheckStore>()(
    (set, get) => {
        function addDiff(newDiff: SkillCheckDiff) {

            set(state => {
                const updatedDiffs = appendDiff(state._diffs, newDiff)

                return { _diffs: updatedDiffs, changeCount: updatedDiffs.length }
            })
        }

        return {
            status: 'Loading',
            assesseeIds: [],
            skillIds: [],
            checks: {},
            _diffs: [],
            changeCount: 0,
            
            init(data) {
                // Only add the state if it's not already been initialised
                const existing = get()

                if(existing.status == 'Loading' || existing.session?.id != data.session.id) {
                    set({ status: 'Ready', _diffs: [], changeCount: 0, ...R.pick(data, ['session', 'assesseeIds', 'skillIds', 'checks'])})

                }
            },
            
            updateSession(session) {
                set({ session })
                addDiff({ type: 'UPDATE_SESSION', session })
            },
            addAssessee(assesseeId) {
                set(state => ({ assesseeIds: [...state.assesseeIds, assesseeId] }))
                addDiff({ type: 'ADD_ASSESSEE', assesseeId })
            },
            removeAssessee(assesseeId) {
                set(state => ({ assesseeIds: state.assesseeIds.filter(id => id != assesseeId) }))
                addDiff({ type: 'REMOVE_ASSESSEE', assesseeId })
            },
            addSkill(skillId) {
                
                set(state => ({ skillIds: [...state.skillIds, skillId] }))
                addDiff({ type: 'ADD_SKILL', skillId })
            },
            removeSkill(skillId) {
                set(state => ({ skillIds: state.skillIds.filter(id => id != skillId) }))
                addDiff({ type: 'REMOVE_SKILL', skillId })
            },
            updateSkillCheck(check) {
                set(state => ({ checks: { ...state.checks, [check.id]: check } }))
                addDiff({ type: 'UPDATE_CHECK', check })
            },
            async save() {
                set({ status: 'Saving', changeCount: 0 })

                const { session, _diffs } = get()
                assertNonNull(session, 'Session is required to save')
                
                await saveSessionAction(session.id, _diffs)

                set({ status: 'Saved', _diffs: [], changeCount: 0 })
            },
        }
    }
)

/**
 * Component to inject an assessment into the AssessmentStore.
 * @param props AssessmentStoreInitData
 */
export function LoadStoreData(props: SkillCheckStoreInitData) {
    const init = useSkillCheckStore(state => state.init)

    React.useEffect(() => {
        init(props)
    }, [init, props])

    return React.createElement(React.Fragment)
}


export function findSkillCheck(skillChecks: SkillCheck_Client[], skillId: string, assesseeId: string) {
    return skillChecks.find(check => check.skillId == skillId && check.assesseeId == assesseeId)
        ?? { id: createUUID(), skillId, assesseeId, competenceLevel: 'NotAssessed', notes: "", timestamp: new Date().toISOString() }
}
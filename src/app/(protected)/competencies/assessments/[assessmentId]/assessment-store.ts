/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as React from 'react'
import * as R from 'remeda'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { SkillCheck, type CompetencyAssessment } from '@prisma/client'
import { WithSerializedDates } from '@/lib/serialize'

export type ClientSkillCheck = WithSerializedDates<SkillCheck>

/**
 * Store for the current competency assessment.
 */
export interface AssessmentStore {
    // Data
    assessment?: CompetencyAssessment
    assesseeIds: string[]
    skillIds: string[]
    checks: Record<string, ClientSkillCheck>
    saveStatus: 'Ready' | 'Saving' | 'Saved'

    getSkillCheck(skillId: string, assesseeId: string): ClientSkillCheck | undefined

    // Actions
    init(data: AssessmentStoreInitData): void
    updateAssessment(partial: Partial<CompetencyAssessment>): void
    addAssessee(assesseeId: string): void
    removeAssessee(assesseeId: string): void
    addSkill(skillId: string): void
    removeSkill(skillId: string): void
    recordCheck(check: ClientSkillCheck): void
}

type AssessmentStoreInitData = Required<Pick<AssessmentStore, 'assessment' | 'assesseeIds' | 'skillIds' | 'checks'>>

export const useAssessmentStore = create<AssessmentStore>()(
    persist(
        (set, get) => ({
            assesseeIds: [],
            skillIds: [],
            checks: {},
            saveStatus: 'Ready',
            getSkillCheck(skillId, assesseeId) {
                return R.values(get().checks).find(check => check.skillId == skillId && check.assesseeId == assesseeId)
            },
            init(data) {
                // Only add the state if it's not already been initialised
                if(get().assessment == undefined) {
                    set(R.pick(data, ['assessment', 'assesseeIds', 'skillIds', 'checks']))
                }
            },
            updateAssessment(partial) {
                set(state => ({ assessment: { ...state.assessment!!, ...partial  } }))
            },
            addAssessee(assesseeId) {
                set(state => ({ assesseeIds: [...state.assesseeIds, assesseeId] }))
            },
            removeAssessee(assesseeId) {
                set(state => ({ assesseeIds: state.assesseeIds.filter(id => id != assesseeId)}))
            },
            addSkill(skillId) {
                set(state => ({ skillIds: [...state.skillIds, skillId] }))
            },
            removeSkill(skillId) {
                set(state => ({ skillIds: state.skillIds.filter(id => id != skillId) }))
            },
            recordCheck(check) {
                set(R.piped(R.prop('checks'), R.set(check.id, check)))
            }
        }),
        {
            name: 'rtplus-competency-assessment',
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)

/**
 * Component to inject an assessment into the AssessmentStore.
 * @param props AssessmentStoreInitData
 */
export function LoadStoreData(props: AssessmentStoreInitData) {
    const init = useAssessmentStore(state => state.init)

    React.useEffect(() => {
        init(props)
    }, [])

    return React.createElement(React.Fragment)
}
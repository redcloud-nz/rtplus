/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as React from 'react'
import * as R from 'remeda'
import { create } from 'zustand'

import { SkillCheck, type SkillCheckSession } from '@prisma/client'

import { createUUID } from '@/lib/id'
import { WithSerializedDates } from '@/lib/serialize'


export type SkillCheck_Client = WithSerializedDates<Omit<SkillCheck, 'orgId' | 'userId' | 'sessionId' | 'assessorId'>>
export type SkillCheckSession_Client = WithSerializedDates<Omit<SkillCheckSession, 'orgId' | 'userId' | 'createdAt' | 'updatedAt'>>

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

    getSkillCheck(skillId: string, assesseeId: string): SkillCheck_Client

    // Actions
    init(data: SkillCheckStoreInitData): void
    updateSession(partial: Partial<SkillCheckSession_Client>): void
    addAssessee(assesseeId: string): void
    removeAssessee(assesseeId: string): void
    addSkill(skillId: string): void
    removeSkill(skillId: string): void
    recordCheck(check: SkillCheck_Client): void
}

type SkillCheckStoreInitData = Required<Pick<SkillCheckStore, 'session' | 'assesseeIds' | 'skillIds' | 'checks'>>

export const useSkillCheckStore = create<SkillCheckStore>()(
    (set, get) => ({
        status: 'Loading',
        assesseeIds: [],
        skillIds: [],
        checks: {},
        getSkillCheck(skillId, assesseeId) {
            return R
                .values(get().checks)
                .find(check => check.skillId == skillId && check.assesseeId == assesseeId)
                ?? { id: createUUID(), skillId, assesseeId, competenceLevel: 'NotAssessed', notes: "", timestamp: new Date().toISOString() }
        },
        init(data) {
            // Only add the state if it's not already been initialised
            const existing = get()

            if(existing.status == 'Loading' || existing.session?.id != data.session.id) {
                set({ status: 'Ready', ...R.pick(data, ['session', 'assesseeIds', 'skillIds', 'checks'])})

            }
        },
        updateSession(partial) {
            set(state => ({ session: { ...state.session!, ...partial  } }))
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
        },
        save() {
            set({ status: 'Saving' })
            // Save the assessment data to the server
            set({ status: 'Saved' })
        }
    })
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
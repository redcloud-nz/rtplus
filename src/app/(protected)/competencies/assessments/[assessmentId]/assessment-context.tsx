/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import React from 'react'

import { LocalObjectStore } from '@/lib/local-object-store'
import { resolveAfter } from '@/lib/utils'
import { CompetencyAssessmentWithRelations } from '@/lib/api/competency-assessments'

export interface SkillCheck {
    id: string
    skillId: string
    assesseeId: string
    assessorId: string
    result: string
    notes: string
}

export const AssessmentStore = new LocalObjectStore<CompetencyAssessmentWithRelations>('CompetencyAssessment', {})


interface AssessmentContext {
    value: CompetencyAssessmentWithRelations
    setValue(newValue: CompetencyAssessmentWithRelations, persist?: boolean): void
    updateValue(updated: Partial<CompetencyAssessmentWithRelations> | ((prev: CompetencyAssessmentWithRelations) => CompetencyAssessmentWithRelations), persist?: boolean): void
    save(valueToSave?: CompetencyAssessmentWithRelations): Promise<void>
    saveStatus: 'Ready' | 'Saving' | 'Saved'
}

export const AssessmentContext = React.createContext<AssessmentContext | undefined>(undefined)

export function AssessmentContextProvider({ assessment, children }: { assessment: CompetencyAssessmentWithRelations, children: React.ReactNode }) {
    const [value, setValue] = React.useState(assessment)
    const [saveStatus, setSaveStatus] = React.useState<AssessmentContext['saveStatus']>('Ready')

    const context: AssessmentContext = {
        value,
        setValue(newValue, persist = false) {
            setValue(newValue)
            if(persist) this.save(newValue)
        },
        updateValue(updater, persist = false) {
            setSaveStatus('Ready')
            const newValue = typeof updater == 'function' ? updater(value) : { ...value, updater}
            setValue(newValue)
            if(persist) this.save(newValue)
        },
        async save(valueToSave = value) {
            setSaveStatus('Saving')
            AssessmentStore.setObject(assessment.id, valueToSave)
            await resolveAfter(null, 1000)
            setSaveStatus('Saved')
        },
        saveStatus
    }

    return <AssessmentContext.Provider value={context}>
        {children}
    </AssessmentContext.Provider>
}

export function useAssessmentContext(): AssessmentContext {
    const context = React.useContext(AssessmentContext)
    if(context == undefined) {
        throw new Error("useAssessmentState() used outside of AssessmentContextProvider.")
    }

    return context
}

import React from 'react'

import { CompetencyAssessment } from '@prisma/client'
import { LocalObjectStore } from '@/lib/local-object-store'
import { resolveAfter } from '@/lib/utils'
import { WithSerializedDates } from '@/lib/serialize'

export interface CompetencyAssessmentWithRelations extends CompetencyAssessment {
    assesseeIds: string[]
    skillIds: string[]
    skillChecks: WithSerializedDates<SkillCheck>[]
}

export interface SkillCheck {
    id: string
    skillId: string
    assesseeId: string
    assessorId: string
    result: string
    notes: string
}

function createEmptyAssessment(assessmentId: string): CompetencyAssessmentWithRelations {
    const now = new Date()
    return {
        id: assessmentId,
        name: '',
        location: '',
        date: now,
        status: 'Draft',
        createdAt: now,
        updatedAt: now,
        assesseeIds: [],
        skillIds: [],
        skillChecks: []
    }
}


export const AssessmentStore = new LocalObjectStore<CompetencyAssessmentWithRelations>('CompetencyAssessment', {})


interface AssessmentContext {
    value: CompetencyAssessmentWithRelations
    setValue(newValue: CompetencyAssessmentWithRelations): void
    updateValue(updated: Partial<CompetencyAssessmentWithRelations> | ((prev: CompetencyAssessmentWithRelations) => CompetencyAssessmentWithRelations)): void
    save(): Promise<void>
    saveStatus: 'Ready' | 'Saving' | 'Saved'
}

export const AssessmentContext = React.createContext<AssessmentContext | undefined>(undefined)

export function AssessmentContextProvider({ assessmentId, children }: { assessmentId: string, children: React.ReactNode }) {
    const [value, setValue] = React.useState(createEmptyAssessment(assessmentId))
    const [saveStatus, setSaveStatus] = React.useState<AssessmentContext['saveStatus']>('Ready')

    React.useEffect(() => {
        const found = AssessmentStore.getObject(assessmentId)
        if(found) setValue(found)
    }, [assessmentId])

    const context: AssessmentContext = {
        value,
        setValue,
        updateValue(updater) {
            setSaveStatus('Ready')
            if(typeof updater == 'function') {
                setValue(updater(value))
            } else {
                setValue({ ...value, ...updater })
            }
        },
        async save() {
            setSaveStatus('Saving')
            AssessmentStore.setObject(assessmentId, value)
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
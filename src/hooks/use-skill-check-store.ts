/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

/* eslint-disable */
'use client'

import { useMemo, useState } from 'react'
import { fromEntries, isEmpty, omit, pick, values } from 'remeda'

import { useMutation, useQueryClient, useSuspenseQueries } from '@tanstack/react-query'

import { useToast } from '@/hooks/use-toast'
import { CompetenceLevel, isPass } from '@/lib/competencies'
import { PersonId } from '@/lib/schemas/person'
import { SkillId } from '@/lib/schemas/skill'
import { SkillCheckData, SkillCheckId, skillCheckSchema } from '@/lib/schemas/skill-check'
import { SkillCheckSessionId } from '@/lib/schemas/skill-check-session'

import { trpc } from '@/trpc/client'
import { z } from 'zod'



const DEFAULT_RESULT_VALUE = ''
const DEFAULT_NOTES_VALUES = ''

type CheckState = Pick<SkillCheckData, 'assesseeId' | 'skillId' | 'skillCheckId' | 'result' | 'notes'>

function createEmptyCheck(assesseeId: PersonId, skillId: SkillId): CheckState {
    return {
        assesseeId,
        skillId,
        skillCheckId: SkillCheckId.create(),
        result: DEFAULT_RESULT_VALUE,
        notes: DEFAULT_NOTES_VALUES,
    }
}

/**
 * The return type of getCheck method in SkillCheckStore.
 */
export type GetCheckReturn = Omit<CheckState, 'skillCheckId'> & { isDirty: boolean, savedValue: SkillCheckData | null }

/**
 * A hook to manage the state of skill checks for a given session.
 * 
 * This hook provides methods to get, update, save, and reset skill checks.
 * It uses React Query for data fetching and mutation, and manages local state for modified checks.
 */
interface SkillCheckStore {

    /**
     * Whether there are unsaved changes to any skill checks.
     */
    isDirty: boolean

    /**
     * Get the current state of a skill check for a given assessee and skill.
     * If the check has been modified, the modified state is returned.
     * If the check has been saved but not modified, the saved state is returned.
     * If the check does not exist, a new empty check is returned.
     * 
     * @param params - The assesseeId and skillId to identify the skill check.
     * @returns The current state of the skill check, whether it is dirty, and the saved value if it exists.
     */
    getCheck(params: { assesseeId: PersonId, skillId: SkillId }): GetCheckReturn

    /**
     * Update the state of a skill check for a given assessee and skill.
     * This marks the check as dirty and stores the modified state locally.
     * @param params - The assesseeId and skillId to identify the skill check.
     * @return A function that takes the updates to apply to the skill check.
     */
    updateCheck(params: { assesseeId: PersonId, skillId: SkillId }): (update: { result?: string, notes?: string }) => void

    /**
     * Save all modified skill checks to the server.
     * This will send the modified checks to the server and update the local state accordingly.
     * If there are no changes to save, an error is thrown.
     */
    saveChecks(): Promise<void>

    /**
     * Reset all modified skill checks to their saved state.
     * This will discard any unsaved changes and revert to the last saved state.
     */
    reset(): void

    mutationStatus?: 'idle' | 'pending' | 'error' | 'success'
}


export function useSkillCheckStore_experimental(orgId: string, sessionId: SkillCheckSessionId): SkillCheckStore {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    

    const [{ data: assessor }, { data: session }, { data: savedChecksArray }] = useSuspenseQueries({
        queries: [
            trpc.personnel.getCurrentPerson.queryOptions({ orgId }),
            trpc.skillChecks.getSession.queryOptions({ orgId, sessionId }),
            trpc.skillChecks.getSessionChecks.queryOptions({ orgId, sessionId, assessorId: 'me' })
        ]
    })

    if(assessor == null) throw new Error('Current user must have an associated person to use skill check store')

    const savedChecks = useMemo(() => fromEntries(savedChecksArray.map(check => [`${check.assesseeId}|${check.skillId}`, check])), [savedChecksArray])
    const [modifiedChecks, setModifiedChecks] = useState<Record<`${string}|${string}`, CheckState>>({})

    const saveChecksMutation = useMutation(trpc.skillChecks.saveSessionChecks.mutationOptions({
        async onMutate(data) {
            const checkUpdates = z.array(skillCheckSchema.pick({ skillCheckId: true, skillId: true, assesseeId: true, result: true, notes: true })).parse(data.checks)

            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries(trpc.skillChecks.getSessionChecks.queryFilter({ sessionId, assessorId: 'me' }))

            const prevData = queryClient.getQueryData(trpc.skillChecks.getSessionChecks.queryKey({ sessionId, assessorId: 'me' }))

            queryClient.setQueryData(trpc.skillChecks.getSessionChecks.queryKey({ sessionId, assessorId: 'me' }), (oldData: SkillCheckData[] = []) => {
                // Checks that were previously saved need to be updated.
                const updatedSkillChecks = oldData.map(check => {
                    const update = checkUpdates.find(c => c.skillCheckId === check.skillCheckId)
                    return update ? { ...check, ...update, passed: isPass(update.result as CompetenceLevel) } : check
                })

                // New checks that need to be added.
                const newSkillChecks = checkUpdates
                    .filter(update => !oldData.some(check => check.skillCheckId === update.skillCheckId))
                    .map(update => ({ ...update, sessionId, assessorId: assessor?.personId, date: session!.date, passed: isPass(update.result as CompetenceLevel), timestamp: new Date().toISOString(), checkStatus: 'Draft' } satisfies SkillCheckData))

                return [...updatedSkillChecks, ...newSkillChecks]
            })

            return { prevData }
        },
        onError(error, _data, context) {
            queryClient.setQueryData(trpc.skillChecks.getSessionChecks.queryKey({ sessionId, assessorId: 'me' }), context?.prevData)

            toast({
                title: 'Error saving skill checks',
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(result) {
            toast({
                title: 'Skill checks saved',
                description: `Your ${result.checks.length} skill checks have been saved successfully`,
            })

            setTimeout(() => { saveChecksMutation.reset() }, 2000) 
        }
    }))

    return useMemo(() => ({
        isDirty: !isEmpty(modifiedChecks),

        getCheck({ assesseeId, skillId }): GetCheckReturn {
            // First, find the saved version of this check
            const savedCheck = savedChecks[`${assesseeId}|${skillId}`]

            // If there is a modified version of this check, return it
            const modifiedCheck = modifiedChecks[`${assesseeId}|${skillId}`]
            if (modifiedCheck) return { ...pick(modifiedCheck, ['assesseeId', 'skillId', 'result', 'notes']), isDirty: true, savedValue: savedCheck }

            if(savedCheck) return { ...pick(savedCheck, ['assesseeId', 'skillId', 'result', 'notes']), isDirty: false, savedValue: savedCheck }

            // Otherwise, return a new, empty check
            return {
                assesseeId, skillId,
                result: DEFAULT_RESULT_VALUE,
                notes: DEFAULT_NOTES_VALUES,
                isDirty: false,
                savedValue: null
            }
        },
        updateCheck({ assesseeId, skillId }) {
            return (update) => {
                setModifiedChecks(prevChecks => {
                    const saved = savedChecks[`${assesseeId}|${skillId}`]
                    const prev = prevChecks[`${assesseeId}|${skillId}`]

                     if(saved && update.result == saved.result && update.notes == saved.notes) {
                        // Updated values match the saved values
                        
                        // If there is a previous modified state, remove it
                        if(prev) return omit(prevChecks, [`${assesseeId}|${skillId}`])
                        
                        // No previous modified state, nothing to do
                        return prevChecks
                    }


                    if(prev) {
                        // Update the already modified state
                        return { ...prevChecks, [`${assesseeId}|${skillId}`]: { ...prev, ...update } }
                    }

                    // Create a new modified state
                    return { ...prevChecks, [`${assesseeId}|${skillId}`]: { ...createEmptyCheck(assesseeId, skillId), ...update } satisfies CheckState }
                })
            }
        },

        async saveChecks() {
            
            if(isEmpty(modifiedChecks)) throw new Error('No changes to save')

            await saveChecksMutation.mutateAsync({ 
                orgId, sessionId, 
                checks: values(modifiedChecks)
            })
            setModifiedChecks({})
        },
        reset() {
            setModifiedChecks({})
        },
        mutationStatus: saveChecksMutation.status
    }), [assessor, modifiedChecks, savedChecks, saveChecksMutation, session])
}

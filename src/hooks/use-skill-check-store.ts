/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

/* eslint-disable */
'use client'

import { useMemo, useState } from 'react'
import { entries, fromEntries, values } from 'remeda'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/hooks/use-toast'
import { CompetenceLevel, isPass } from '@/lib/competencies'
import { nanoId16 } from '@/lib/id'
import { PersonId } from '@/lib/schemas/person'
import { SkillId } from '@/lib/schemas/skill'
import { SkillCheckData } from '@/lib/schemas/skill-check'

import { useTRPC } from '@/trpc/client'



const DEFAULT_RESULT_VALUE = ''
const DEFAULT_NOTES_VALUES = ''
const EMPTY_SKILL_CHECKS_ARRAY: SkillCheckData[] = []

interface CheckState {
    readonly assesseeId: string
    readonly skillId: string
    readonly skillCheckId: string
    readonly prev: SkillCheckData | null
    readonly current: Pick<SkillCheckData, 'result' | 'notes'>
    readonly isDirty: boolean
}

interface SkillCheckStore {
    isDirty: boolean

    getCheck(params: { assesseeId: string, skillId: string }): Pick<SkillCheckData, 'assesseeId' | 'skillId' | 'result' | 'notes'> & { isDirty: boolean, prev: Pick<SkillCheckData, 'result' | 'notes'> | null }

    updateCheck(params: { assesseeId: string, skillId: string }): (update: { result?: string, notes?: string }) => void

    loadChecks(checkFilter: { assesseeId?: string, skillId?: string }): void

    saveChecks(): Promise<void>

    reset(): void
}


export function useSkillCheckStore_experimental(sessionId: string): SkillCheckStore {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: assessor } = useQuery(trpc.currentUser.getPerson.queryOptions())
    const { data: session } = useQuery(trpc.skillCheckSessions.getSession.queryOptions({ sessionId }))
    const { data: existingChecks = EMPTY_SKILL_CHECKS_ARRAY } = useQuery(trpc.skillCheckSessions.getChecks.queryOptions({ sessionId, assessorId: 'me' }))

    const [checks, setChecks] = useState<Record<`${PersonId}${SkillId}`, CheckState>>({})

    const mutation = useMutation(trpc.skillCheckSessions.saveChecks.mutationOptions({
        async onMutate(data) {
            await queryClient.cancelQueries(trpc.skillCheckSessions.getChecks.queryFilter({ sessionId, assessorId: 'me' }))

            const prevData = queryClient.getQueryData(trpc.skillCheckSessions.getChecks.queryKey({ sessionId, assessorId: 'me' }))

            queryClient.setQueryData(trpc.skillCheckSessions.getChecks.queryKey({ sessionId, assessorId: 'me' }), (oldData: SkillCheckData[] = []) => {

                const updatedSkillChecks = oldData.map(check => {
                    const update = data.checks.find(c => c.skillCheckId === check.skillCheckId)
                    return update ? { ...check, ...update, passed: isPass(update.result as CompetenceLevel) } : check
                })

                const newSkillChecks = data.checks
                    .filter(update => !oldData.some(check => check.skillCheckId === update.skillCheckId))
                    .map(update => ({ ...update, sessionId, teamId: session!.teamId, assessorId: assessor!.personId, date: session!.date, passed: isPass(update.result as CompetenceLevel), timestamp: new Date().toISOString() } satisfies SkillCheckData))

                return [...updatedSkillChecks, ...newSkillChecks]
            })

            return { prevData }
        },
        onError(error, _data, context) {
            queryClient.setQueryData(trpc.skillCheckSessions.getChecks.queryKey({ sessionId, assessorId: 'me' }), context?.prevData)

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

            queryClient.invalidateQueries(trpc.skillCheckSessions.getChecks.queryFilter({ sessionId, assessorId: 'me' }))
        }
    }))

    return useMemo(() => ({
        isDirty: entries(checks).some(([, check]) => check.isDirty),

        getCheck({ assesseeId, skillId }) {
            const check = checks[`${assesseeId}${skillId}`]
            if (check) return {
                assesseeId, skillId,
                result: check.current.result,
                notes: check.current.notes,
                isDirty: check.isDirty,
                prev: check.prev ? { result: check.prev.result, notes: check.prev.notes } : null
            }

            return {
                assesseeId, skillId,
                result: DEFAULT_RESULT_VALUE,
                notes: DEFAULT_NOTES_VALUES,
                isDirty: false,
                prev: null
            }
        },
        updateCheck({ assesseeId, skillId }) {
            return (update) => {
                setChecks(prevChecks => {
                    const found = prevChecks[`${assesseeId}${skillId}`]
                    return {
                        ...prevChecks,
                        [`${assesseeId}${skillId}`]: found
                            ? { ...found, current: { ...found.current, ...update }, isDirty: true }
                            : { assesseeId, skillId, skillCheckId: nanoId16(), current: { result: DEFAULT_RESULT_VALUE, notes: DEFAULT_NOTES_VALUES, ...update }, prev: null, isDirty: true }
                    }
                })
            }
        },

        loadChecks(checkFilter) {
            const filteredChecks = existingChecks.filter(check => {
                if (checkFilter.assesseeId && check.assesseeId != checkFilter.assesseeId) return false
                if (checkFilter.skillId && check.skillId != checkFilter.skillId) return false
                return true
            })
            setChecks(fromEntries(filteredChecks.map(check => [
                `${check.assesseeId}${check.skillId}`,
                {
                    assesseeId: check.assesseeId,
                    skillId: check.skillId,
                    skillCheckId: check.skillCheckId,
                    prev: check,
                    current: {
                        result: check.result,
                        notes: check.notes,
                    },
                    isDirty: false,
                }
            ])))
        },
        async saveChecks() {
            const dirtyChecks = values(checks).filter(check => check.isDirty)
            if(dirtyChecks.length == 0) throw new Error('No changes to save')

            await mutation.mutateAsync({ 
                sessionId, 
                checks: dirtyChecks
                    .map(check => ({
                        skillCheckId: check.skillCheckId,
                        assesseeId: check.assesseeId,
                        skillId: check.skillId,
                        result: check.current.result,
                        notes: check.current.notes,
                    })) 
            })
            setChecks({})
        },
        reset() {
            setChecks({})
        }
    }), [assessor, checks, existingChecks, mutation, session])
}

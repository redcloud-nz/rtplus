/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

/* eslint-disable */
'use client'

import { pick } from 'remeda'
import { create } from 'zustand'

import { nanoId16 } from '@/lib/id'
import { SkillCheckData } from '@/lib/schemas/skill-check'
import { useMemo, useState } from 'react'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'

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
    getCheck: (params: { assesseeId: string, skillId: string }) => Pick<SkillCheckData, 'assesseeId' | 'skillId' | 'result' | 'notes'> & { isDirty: boolean }
}


export function useSkillCheckStore_experimental(sessionId: string): SkillCheckStore {
    const trpc = useTRPC()

    const assessorQuery = useQuery(trpc.currentUser.getPerson.queryOptions())
    const sessionQuery = useQuery(trpc.skillCheckSessions.getSession.queryOptions({ sessionId }))
    const { data: existingChecks = EMPTY_SKILL_CHECKS_ARRAY } = useQuery(trpc.skillCheckSessions.getChecks.queryOptions({ sessionId }))

    const [checks, setChecks] = useState<CheckState[]>([])

    return useMemo(() => ({
        isDirty: checks.some(check => check.isDirty),

        getCheck({ assesseeId, skillId }) {
            const updatedCheck = checks.find(check => check.assesseeId === assesseeId && check.skillId === skillId)
            if (updatedCheck) return {
                assesseeId, skillId,
                result: updatedCheck.current.result, 
                notes: updatedCheck.current.notes,
                isDirty: updatedCheck.isDirty, 
            }

            const existingCheck = existingChecks.find(check => check.assesseeId === assesseeId && check.skillId === skillId)
            if (existingCheck) {
                return {
                    assesseeId, skillId,
                    result: existingCheck.result,
                    notes: existingCheck.notes,
                    isDirty: false,
                }
            }

            return {
                assesseeId, skillId,
                result: DEFAULT_RESULT_VALUE,
                notes: DEFAULT_NOTES_VALUES,
                isDirty: false,
            }
        }
    }), [checks])
}

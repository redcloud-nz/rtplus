/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import { parseISO } from 'date-fns'
import * as R from 'remeda'

import { authenticated } from '@/server/auth'
import prisma from '@/server/prisma'

import { type SkillCheckDiff } from './skill-check-data'



export async function saveSessionAction(sessionId: string, diffs: SkillCheckDiff[]) {
   
    const { userPersonId } = await authenticated()

    const existingSession = await prisma.skillCheckSession.findUnique({
        where: { id: sessionId, assessorId: userPersonId }
    })
    if(!existingSession) {
        throw new Error(`Session not found for sessionId=${sessionId}`)
    }

    const sessionData = diffs.find(diff => diff.type === 'UPDATE_SESSION')?.session
    const addedAssessees = diffs.filter(diff => diff.type === 'ADD_ASSESSEE').map(diff => ({ id: diff.assesseeId }))
    const removedAssessees = diffs.filter(diff => diff.type === 'REMOVE_ASSESSEE').map(diff => ({ id: diff.assesseeId }))
    const addedSkills = diffs.filter(diff => diff.type === 'ADD_SKILL').map(diff => ({ id: diff.skillId }))
    const removedSkills = diffs.filter(diff => diff.type === 'REMOVE_SKILL').map(diff => ({ id: diff.skillId }))
    const updatedChecks = diffs.filter(diff => diff.type === 'UPDATE_CHECK').map(({ check: { timestamp, ...check }}) => ({ ...check, timestamp: parseISO(timestamp) }))

    await prisma.skillCheckSession.update({
        where: { id: sessionId },
        data: {
            ...(sessionData ? sessionData : {}),
            assessees: {
                connect: addedAssessees,
                disconnect: removedAssessees
            },
            skills: {
                connect: addedSkills,
                disconnect: removedSkills
            },
            checks: {
                upsert: updatedChecks.map(check => ({
                    where: { id: check.id },
                    update: R.pick(check, ['competenceLevel', 'notes', 'timestamp']),
                    create: { ...check, assessorId: existingSession.assessorId }
                }))
            }
        }
    })

    
}
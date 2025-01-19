/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import { auth } from '@clerk/nextjs/server'

import { SkillCheckDiff } from './skill-check-data'
import prisma from '@/lib/prisma'

export async function saveSessionAction(sessionId: string, diffs: SkillCheckDiff[]) {
   
    const { userId, orgId } = await auth.protect()

    const existingSession = await prisma.skillCheckSession.findFirst({ 
        where: { orgId, userId, id: sessionId },
        include: { 
            checks: true, 
            assessees: true, 
            skills: true
        },
    })

    if(!existingSession) {
        throw new Error(`Session not found for sessionId=${sessionId}`)
    }
}
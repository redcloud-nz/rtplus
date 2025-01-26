/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/skill-check-sessions/[sessionId]
 */

import { NextRequest } from 'next/server'

import { createNotFoundResponse, createObjectResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'


 
export async function GET(request: NextRequest, props: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await props.params

    const session = await prisma.skillCheckSession.findFirst({
        where: { id: sessionId },
        include: {
            skills: { select: { id: true } },
            assessees: { select: { id: true } }

        }
    })

    if(session) return createObjectResponse(session)
    else return createNotFoundResponse(`No such SkillCheckSession(${sessionId})`)
}
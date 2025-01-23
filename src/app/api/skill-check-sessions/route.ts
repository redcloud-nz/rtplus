/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/skill-check-sessions
 */

import { NextRequest } from 'next/server'

import { auth } from '@clerk/nextjs/server'
import { SkillCheckSession } from '@prisma/client'

import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

 
export async function GET(request: NextRequest) {
    const { userId } = await auth.protect()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as SkillCheckSession['status']


    const assessments: SkillCheckSession[] = await prisma.skillCheckSession.findMany({
        where: { 
            userId,
            ... status ? { status } : {}
        }
    })

    return Response.json(createListResponse(assessments))
}
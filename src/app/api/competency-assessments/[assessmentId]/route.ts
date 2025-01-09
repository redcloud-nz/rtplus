/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/competency-assessments/[assessmentId]
 */

import { NextRequest } from 'next/server'

import { auth } from '@clerk/nextjs/server'

import { createNotFoundResponse, createObjectResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'


 
export async function GET(request: NextRequest, props: { params: Promise<{ assessmentId: string }> }) {
    const { orgId, userId } = await auth.protect()
    const { assessmentId } = await props.params

    const assessment = await prisma.competencyAssessment.findFirst({
        where: { 
            orgId, userId,
        },
        include: {
            skills: { select: { id: true } },
            assessees: { select: { id: true } }

        }
    })

    if(assessment) return createObjectResponse(assessment)
    else return createNotFoundResponse(`No such CompetencyAssessment(${assessmentId})`)
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/skills
 */

import { auth } from '@clerk/nextjs/server'

import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

export async function GET() {
    await auth.protect()
    
    const skills = await prisma.skill.findMany()

    return createListResponse(skills)
}
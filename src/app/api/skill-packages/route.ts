/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/skill-packages
 */

import { auth } from '@clerk/nextjs/server'

import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

export async function GET() {
     await auth.protect()
    
    const packages = await prisma.skillPackage.findMany({
        include: {
            skillGroups: true,
            skills: true
        }
    })

    return createListResponse(packages)
}
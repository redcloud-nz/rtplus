/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/skill-packages
 */


import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/server/prisma'

export async function GET() {

    
    const packages = await prisma.skillPackage.findMany({
        include: {
            skillGroups: true,
            skills: true
        }
    })

    return createListResponse(packages)
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/personnel
 */

import { auth } from '@clerk/nextjs/server'

import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/server/prisma'

export async function GET() {
    await auth.protect()

    const personnel = await prisma.person.findMany({
        orderBy: { name: 'asc' }
    })

    return createListResponse(personnel)
}
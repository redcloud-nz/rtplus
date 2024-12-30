/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/personnel
 */

import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

export async function GET() {

    const personnel = await prisma.person.findMany({
        orderBy: { name: 'asc' }
    })

    return Response.json(createListResponse(personnel))
}
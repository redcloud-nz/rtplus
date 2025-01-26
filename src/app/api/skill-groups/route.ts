/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/skill-groups
 */

import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/server/prisma'

export async function GET() {
    
    const skillGroups = await prisma.skillGroup.findMany()

    return createListResponse(skillGroups)
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import { authenticated } from '@/lib/server/auth'
import prisma from '@/lib/server/prisma'

export async function getPersonnelCountAction(): Promise<number> {

    await authenticated()

    const personCount = prisma.person.count()

    return personCount
}
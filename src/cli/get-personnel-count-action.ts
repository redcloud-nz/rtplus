/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import prisma from '@/server/prisma'
import { auth } from '@clerk/nextjs/server'

export async function getPersonnelCountAction(): Promise<number> {

    await auth.protect()

    const personCount = prisma.person.count()

    return personCount
}
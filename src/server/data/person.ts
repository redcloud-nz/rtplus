/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { revalidateTag, unstable_cache } from 'next/cache'

import { Person as PersonRecord } from '@prisma/client'


import prisma from '../prisma'

export const fetchPersonByIdCached = unstable_cache(
    async (id: string): Promise<PersonRecord | null> => {
        return await prisma.person.findUnique({
            where: { id },
        })
    },
    ['person'],
    {
        tags: ["person"],
        revalidate: 60, // 1 minute
    }
)

export function revalidatePersonCache() {
    revalidateTag('person')
}

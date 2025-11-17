/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { cacheTag, revalidateTag } from 'next/cache'
import { notFound } from 'next/navigation'

import { PersonData, toPersonData } from '@/lib/schemas/person'

import prisma from './prisma'

export async function getPerson(orgId: string, personId: string): Promise<PersonData> {
    'use cache'
    cacheTag(`person-${personId}`)

    // Fetch person record
    const person = await prisma.person.findFirst({
        where: { orgId, personId }
    })

    if(!person) return notFound()

    return toPersonData(person)
}


export async function revalidatePerson(personId: string) {
    revalidateTag(`person-${personId}`, { expire: 0 })
}
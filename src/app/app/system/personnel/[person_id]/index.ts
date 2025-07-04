/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/personnel/[person_id]
 */


import { notFound } from 'next/navigation'
import { cache } from 'react'

import { Person } from '@prisma/client'

import prisma from '@/server/prisma'


export interface PersonParams { person_id: string }

export const getPerson = cache(async (params: Promise<PersonParams>): Promise<Person> => {
    const { person_id: personId } = await params
    const person = await prisma.person.findUnique({ where: { id: personId } })

    return person ?? notFound()
})
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/personnel/[personId]/edit
 */

import { NotFound, NotImplemented } from '@/components/errors'
import { validateUUID } from '@/lib/id'
import prisma from '@/server/prisma'

import * as Paths from '@/paths'

export default async function EditPersonPage(props: { params: Promise<{ personId: string }>}) {
    const { personId } = await props.params
    if(!validateUUID(personId)) throw new Error(`Invalid personId (${personId}) in path`)

    const person = await prisma.person.findUnique({
        include: {
            teamMemberships: {
                include: {
                    team: true
                }
            },
        },
        where: { id: personId }
    })
    if(!person) return <NotFound/>

    return <NotImplemented 
        label="Edit"
        breadcrumbs={[
            { label: "Configure", href: Paths.config.index }, 
            { label: "Personnel", href: Paths.config.personnel.index },
            { label: person.name, href: Paths.config.personnel.person(person.id).index }
        ]}
    />
}
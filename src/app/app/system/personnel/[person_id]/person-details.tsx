/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, TrashIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DropdownMenuGroup, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'





/**
 * Card that displays the details of a person and allows the user to edit them.
 * @param personId The ID of the person to display.
 */
export function PersonDetailsCard({ personId }: { personId: string }) {

    return <Card>
        <CardHeader>
            <CardTitle>Person Details</CardTitle>
            <Button variant="ghost" size="icon" asChild>
                <Link href={Paths.system.person(personId).update} title="Edit Person">
                    <PencilIcon/>
                </Link>
            </Button>
            <CardMenu title="Person">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href={Paths.system.person(personId).delete}>
                            <TrashIcon/> Delete
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </CardMenu>
        </CardHeader>
        <CardBody boundary collapsible>
            <PersonDetailsList personId={personId}/>
        </CardBody>
    </Card>
}   


/**
 * Component that displays the details of a person.
 * @param personId The ID of the person to display.
 */
function PersonDetailsList({ personId }: { personId: string }) {

    const trpc = useTRPC()
    const { data: person } = useSuspenseQuery(trpc.personnel.byId.queryOptions({ personId }))

    return <DL>
        <DLTerm>RT+ ID</DLTerm>
        <DLDetails>{person.id}</DLDetails>

        <DLTerm>Name</DLTerm>
        <DLDetails>{person.name}</DLDetails>
        
        <DLTerm>Email</DLTerm>
        <DLDetails>{person.email}</DLDetails>

        <DLTerm>Status</DLTerm>
        <DLDetails>{person.status}</DLDetails>
    </DL>
}
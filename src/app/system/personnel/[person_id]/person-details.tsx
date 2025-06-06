/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Card, CardBody, CardHeader, CardTitle, CardCollapseToggleButton } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'

import { useTRPC } from '@/trpc/client'

import { EditPersonDialog } from './edit-person'



/**
 * Card that displays the details of a person and allows the user to edit them.
 * @param personId The ID of the person to display.
 */
export function PersonDetailsCard({ personId }: { personId: string }) {

    return <Card>
        <CardHeader>
            <CardTitle>Person Details</CardTitle>
            <EditPersonDialog
                personId={personId}
                trigger={<DialogTriggerButton variant="ghost" size='icon' tooltip="Edit Person">
                    <PencilIcon/>
                </DialogTriggerButton>}
            />
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
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
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */

'use client'

import { useState } from 'react'

import { DeleteObjectIcon, DropdownMenuTriggerIcon, DuplicateObjectIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'


import { OrganizationData } from '@/lib/schemas/organization'
import { PersonId } from '@/lib/schemas/person'

import { AdminModule_DeletePerson_Dialog } from './delete-person'


export function PersonDropdownMenu({ organization, personId }: { organization: OrganizationData, personId: PersonId }) {

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <S2_Button variant="outline" size="icon">
                    <DropdownMenuTriggerIcon/>
                </S2_Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Person</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem disabled>
                        <DuplicateObjectIcon/> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteDialogOpen(true)}>
                        <DeleteObjectIcon/> Delete
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
        <AdminModule_DeletePerson_Dialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            organization={organization}
            personId={personId}
        />
    </>
}


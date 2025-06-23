/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/
'use client'

import { TrashIcon } from 'lucide-react'
import { useState } from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

import { DeletePersonDialog } from './delete-person'


interface PersonMenuProps {
    personId: string
    trigger: React.ReactNode
}

export function PersonMenu({ personId, trigger }: PersonMenuProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false) 

    return <>
        <DropdownMenu>
            {trigger}
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-center">Person</DropdownMenuLabel>
                
                <DropdownMenuSeparator/>
                
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                        <TrashIcon/> Delete
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
        <DeletePersonDialog 
            personId={personId}
            open={deleteDialogOpen} 
            onOpenChange={setDeleteDialogOpen}
        />
    </>
}
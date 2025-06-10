/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { CableIcon, TrashIcon} from 'lucide-react'
import * as React from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { TeamD4hConfigDialog } from './team-d4h-config-dialog'
import { DeleteTeamDialog_sys } from './delete-team'


interface TeamOptionsMenuProps {
    teamId: string
    trigger: React.ReactNode
}

export function TeamMenu_sys({ teamId, trigger }: TeamOptionsMenuProps) {

    const [d4hDialogOpen, setD4hDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

    return <>
        <DropdownMenu>
            {trigger}
            <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuLabel className="text-center">Team</DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setD4hDialogOpen(true)} disabled>
                        <CableIcon/>
                        D4H Integration
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                        <TrashIcon/> Delete
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
        <TeamD4hConfigDialog 
            open={d4hDialogOpen} 
            onOpenChange={setD4hDialogOpen}
            teamId={teamId}
        />
        <DeleteTeamDialog_sys
            teamId={teamId}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
        />
    </>
    
}



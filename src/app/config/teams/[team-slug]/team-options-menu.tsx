/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { CableIcon, Trash2Icon} from 'lucide-react'
import * as React from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { TeamD4hConfigDialog } from './team-d4h-config-dialog'


interface TeamOptionsMenuProps {
    teamId: string
    trigger: React.ReactNode
}

export function TeamOptionsMenu({ teamId, trigger }: TeamOptionsMenuProps) {

    const [d4hDialogOpen, setD4hDialogOpen] = React.useState(false)

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel>
                    Team Options
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setD4hDialogOpen(true)}>
                        <CableIcon/>
                        Configure D4H Integration
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem disabled>
                        <Trash2Icon/>
                        Delete Team
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
        <TeamD4hConfigDialog 
            open={d4hDialogOpen} 
            onOpenChange={setD4hDialogOpen}
            teamId={teamId}
        />
    </>
    
}



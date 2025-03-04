/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { CableIcon, Trash2Icon} from 'lucide-react'
import * as React from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { Link } from '@/components/ui/link'


import * as Paths from '@/paths'


interface TeamOptionsMenuProps {
    teamId: string
    teamSlug: string
    hasD4hInfo: boolean
    hasTeamWritePermission: boolean
    trigger: React.ReactNode
}

export function TeamOptionsMenu({ teamSlug, trigger }: TeamOptionsMenuProps) {

    return <DropdownMenu>
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
                <DropdownMenuItem asChild>
                    <Link href={Paths.config.teams.team(teamSlug).d4h}>
                        <CableIcon/>
                        Configure D4H Integration
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <Trash2Icon/>
                    Delete Team
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
}



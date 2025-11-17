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
import { TeamData} from '@/lib/schemas/team'
import { AdminModule_DeleteTeam_Dialog } from './delete-team'

export function TeamDropdownMenu({ organization, team }: { organization: OrganizationData, team: TeamData }) {

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <S2_Button variant="outline" size="icon">
                    <DropdownMenuTriggerIcon/>
                </S2_Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Team</DropdownMenuLabel>
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
        <AdminModule_DeleteTeam_Dialog
            organization={organization}
            team={team}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
        />
    </>
}

/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { CableIcon, PencilIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'
import { match } from 'ts-pattern'

import { useSuspenseQuery } from '@tanstack/react-query'

import { DeleteTeamForm } from '@/components/forms/delete-team'
import { UpdateTeamForm } from '@/components/forms/update-team'
import { Show } from '@/components/show'
import { Card, CardBody, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/ui/color'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogTriggerButton } from '@/components/ui/dialog'
import { DropdownMenuGroup, DropdownMenuItem } from '@/components/ui/dropdown-menu'

import { useTRPC } from '@/trpc/client'



export function TeamDetailsCard_sys({ teamId }: { teamId: string }) {

    const [dialog, setDialog] = React.useState<'D4hIntegration' | 'Delete' | 'Edit' | null>(null)

    return <Card>
        <CardHeader>
            <CardTitle>Team Details</CardTitle>

            <Dialog open={dialog != null} onOpenChange={open => { if(!open) setDialog(null)}}>
                <DialogTriggerButton variant="ghost" size='icon' tooltip="Edit Team" onClick={() => setDialog('Edit')}>
                    <PencilIcon/>
                </DialogTriggerButton>
                <CardMenu title="Team">
                    <DropdownMenuGroup>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onClick={() => setDialog('D4hIntegration')} disabled>
                                <CableIcon/>
                                D4H Integration
                            </DropdownMenuItem>
                        </DialogTrigger>
                        
                        <DialogTrigger asChild>
                            <DropdownMenuItem onClick={() => setDialog('Delete')}>
                                <TrashIcon/> Delete
                            </DropdownMenuItem>
                        </DialogTrigger>
                    </DropdownMenuGroup>
                </CardMenu>
                <DialogContent>
                    {match(dialog)
                        .with(null, () => null)
                        .with('D4hIntegration', () => <>
                            <DialogHeader>
                                <DialogTitle>D4H Integration</DialogTitle>
                                <DialogDescription>Configure the D4H integration for this team.</DialogDescription>
                            </DialogHeader>
                            <DialogBody>
                                TODO
                            </DialogBody>
                        </>)
                        .with('Delete', () => <>
                            <DialogHeader>
                                <DialogTitle>Delete Team</DialogTitle>
                                <DialogDescription>This action will permanently delete the team.</DialogDescription>
                            </DialogHeader>
                            <DialogBody>
                                <DeleteTeamForm 
                                    teamId={teamId}
                                    onClose={() => setDialog(null)}
                                    />
                            </DialogBody>
                        </>)
                        .with('Edit', () => <>
                            <DialogHeader>
                                <DialogTitle>Edit Team</DialogTitle>
                                <DialogDescription>Edit the team details.</DialogDescription>
                            </DialogHeader>
                            <DialogBody>
                                <UpdateTeamForm
                                    teamId={teamId}
                                    onClose={() => setDialog(null)} 
                                />
                            </DialogBody>
                        </>)
                        .exhaustive()
                    }
                </DialogContent>
            </Dialog>

        </CardHeader>
        <CardBody boundary collapsible>
            <TeamDetailsList_sys teamId={teamId}/>
        </CardBody>
    </Card>
}

function TeamDetailsList_sys({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))
    if(team == null) throw new Error(`Team(${teamId}) not found`)

    return <DL>
        <DLTerm>RT+ ID</DLTerm>
        <DLDetails>{team.id}</DLDetails>

        <DLTerm>Name</DLTerm>
        <DLDetails>{team.name}</DLDetails>

        <DLTerm>Short Name</DLTerm>
        <DLDetails>{team.shortName}</DLDetails>

        <DLTerm>Slug</DLTerm>
        <DLDetails>{team.slug}</DLDetails>

        <Show when={team.color != ''}>
            <DLTerm>Colour</DLTerm>
            <DLDetails>
                <ColorValue value={team.color}/>
            </DLDetails>
        </Show>
        

        <DLTerm>Status</DLTerm>
        <DLDetails>{team.status}</DLDetails>

        {/* {team.d4hInfo?.serverCode ? <>
            <DLTerm>D4H Server</DLTerm>
            <DLDetails>{getD4hServer(team.d4hInfo.serverCode as D4hServerCode).name}</DLDetails>
        </> : null}
        {team.d4hInfo?.d4hTeamId ? <>
            <DLTerm>D4H Team ID</DLTerm>
            <DLDetails>{team.d4hInfo.d4hTeamId}</DLDetails>
        </> : null} */}
    </DL>
}
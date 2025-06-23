/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon } from 'lucide-react'
import * as React from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'

import { Card, CardBody, CardCollapseToggleButton, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/ui/color'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DialogTriggerButton } from '@/components/ui/dialog'

import { useTRPC } from '@/trpc/client'

import { EditTeamDialog_sys } from './edit-team'



export function TeamDetailsCard_sys({ teamId }: { teamId: string }) {

    return <Card>
        <CardHeader>
            <CardTitle>Team Details</CardTitle>
            
            <EditTeamDialog_sys
                teamId={teamId}
                trigger={<DialogTriggerButton variant="ghost" size='icon' tooltip="Edit Team">
                    <PencilIcon/>
                </DialogTriggerButton>}
            />
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
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
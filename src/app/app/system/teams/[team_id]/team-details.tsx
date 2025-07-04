/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { CableIcon, PencilIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { ColorValue } from '@/components/ui/color'
import { DL, DLDetails, DLTerm } from '@/components/ui/description-list'
import { DropdownMenuGroup, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'





export function TeamDetailsCard({ teamId }: { teamId: string }) {

    return <Card>
        <CardHeader>
            <CardTitle>Team Details</CardTitle>

            <Button variant="ghost" size="icon" asChild>
                <Link href={Paths.system.team(teamId).update} title="Edit Team">
                    <PencilIcon/>
                </Link>
            </Button>
        
            <CardMenu title="Team">
                <DropdownMenuGroup>
                    <DropdownMenuItem disabled asChild>
                        <Link href={Paths.system.team(teamId).d4h}>
                            <CableIcon/> D4H Integration
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={Paths.system.team(teamId).delete} title='Delete Team'>
                            <TrashIcon/> Delete
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </CardMenu>
        </CardHeader>
        <CardBody boundary collapsible>
            <TeamDetailsList teamId={teamId}/>
        </CardBody>
    </Card>
}

function TeamDetailsList({ teamId }: { teamId: string }) {
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
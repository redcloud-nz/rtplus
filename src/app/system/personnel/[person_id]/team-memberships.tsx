/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { EllipsisVertical, InfoIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { match } from 'ts-pattern'

import {  useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { EditTeamMembershipDialog } from '@/components/dialogs/edit-team-membership'
import { DeleteTeamMembershipDialog } from '@/components/dialogs/delete-team-membership'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardCollapseToggleButton, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { TeamBasic, TeamMembershipBasic, useTRPC } from '@/trpc/client'

import { AddTeamMembershipDialog } from './add-team-membership'






/**
 * Card that displays the list of all team memberships for a person and allows the user to add a new team membership.
 * @param personId The ID of the person for whom to display team memberships.
 */
export function TeamMembershipsCard({ personId }: { personId: string }) {
    return <Card>
        <CardHeader>
            <CardTitle>Team Memberships</CardTitle>
            <AddTeamMembershipDialog
                personId={personId}
                trigger={<DialogTriggerButton variant='ghost' size="icon" tooltip="Add team membership">
                    <PlusIcon/>
                </DialogTriggerButton>}
            />
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <TeamMembershipsTable personId={personId}/>
        </CardBody>
    </Card>
}


/**
 * Component that displays the list of all team memberships for a person.
 * @param person The person for whom to display team memberships.
 */
function TeamMembershipsTable({ personId }: { personId: string }) {
    const trpc = useTRPC()

    const { data: person } = useSuspenseQuery(trpc.personnel.byId.queryOptions({ personId }))
    const { data: teamMemberships } = useSuspenseQuery(trpc.teamMemberships.byPerson.queryOptions({ personId })) 

    const [actionTarget, setActionTarget] = useState<{ action: 'Edit' | 'Delete', team: TeamBasic, membership: TeamMembershipBasic } | null>(null)

    return <Show 
        when={teamMemberships.length > 0}
        fallback={<Alert severity="info" title="No team memberships defined"/>}
    >
        <Table className="table-fixed">
            <TableHead>
                <TableRow>
                    <TableHeadCell>Team</TableHeadCell>
                    <TableHeadCell>Role</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell className="w-10"></TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {teamMemberships
                    .sort((a, b) => a.team.name.localeCompare(b.team.name))
                    .map(({ team, ...membership }) => 
                        <TableRow key={membership.id}>
                            <TableCell>
                                <Link href={Paths.system.teams.team(team.id).index} className="hover:underline">
                                    {team.name}
                                </Link>
                            </TableCell>
                            <TableCell>{membership.role}</TableCell>
                            <TableCell>{membership.status}</TableCell>
                            <TableCell className="w-10 p-0 text-right overflow-visible">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <EllipsisVertical />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel className="text-center">Team Membership</DropdownMenuLabel>
                                        <Separator/>
                                        <DropdownMenuItem disabled><InfoIcon/>Details</DropdownMenuItem>
                                        <Separator/>
                                        
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => setActionTarget({ action: 'Edit', membership, team })}><PencilIcon/> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setActionTarget({ action: 'Delete', membership, team })}><TrashIcon/> Delete</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>

        {match(actionTarget)
            .with(null, () => null)
            .with({ action: 'Edit' }, ({ team, membership }) => 
                <EditTeamMembershipDialog 
                    key={membership.id}
                    team={team}
                    membership={membership}
                    person={person}
                    open onOpenChange={(open) => { if(!open) setActionTarget(null)}}
                />
            )
            .with({ action: 'Delete' }, ({ team, membership }) => 
                <DeleteTeamMembershipDialog
                    key={membership.id}
                    team={team}
                    person={person}
                    open onOpenChange={(open) => { if(!open) setActionTarget(null)}}
                />
            )
            .exhaustive()
        }
    </Show>
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, PlusIcon } from 'lucide-react'

import {  useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Card, CardBody, CardCollapseToggleButton, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'

import { AddTeamMembershipDialog } from './add-team-membership'
import { EditTeamMembershipDialog } from './edit-team-membership'


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

    return <Show 
        when={teamMemberships.length > 0}
        fallback={<Alert severity="info" title="No team memberships defined"/>}
    >
        <Table className="table-fixed">
            <TableHead>
                <TableRow>
                    <TableHeadCell>Team</TableHeadCell>
                    <TableHeadCell>Role</TableHeadCell>
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
                            <TableCell className="w-10 p-0 text-right">
                                <EditTeamMembershipDialog
                                    membership={membership}
                                    person={person}
                                    team={team}
                                    trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Edit team membership">
                                        <PencilIcon/>
                                    </DialogTriggerButton>}
                                />
                            </TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>
    </Show>
}
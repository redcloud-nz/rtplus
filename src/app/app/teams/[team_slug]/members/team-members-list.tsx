/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FunnelIcon, PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { Link } from '@/components/ui/link'
import { Popover, PopoverContent, PopoverTriggerButton } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { TeamData, useTRPC } from '@/trpc/client'

import { AddTeamMemberDialog } from './add-team-member'


/**
 * Card that displays the list of all team members and allows the user to add a new member.
 */
export function TeamMembersListCard({ team }: { team: TeamData }) {
    
    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <AddTeamMemberDialog
                team={team}
                trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Add member">
                    <PlusIcon />
                </DialogTriggerButton>}
            />
            <Popover>
                <PopoverTriggerButton variant="ghost" size="icon" tooltip="Filter members">
                    <FunnelIcon />
                </PopoverTriggerButton>
                <PopoverContent>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">Filters will be added here in the future.</p>
                        {/* Future filter options can be added here */}
                    </div>
                </PopoverContent>
            </Popover>
        </CardHeader>
        <CardContent boundary>
            <TeamMembersListTable team={team}/>
        </CardContent>
    </Card>
}

function TeamMembersListTable({ team }: { team: TeamData }) {
    const trpc = useTRPC()

    const { data: memberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId: team.teamId }))

    return <Show
        when={memberships.length > 0}
        fallback={<Alert severity="info" title="No members defined">Add some members to get started.</Alert>}
    >
        <Table width="auto">
            <TableHead>
                <TableRow>
                    <TableHeadCell className="w-2/5">Name</TableHeadCell>
                    <TableHeadCell className="w-2/5">Email</TableHeadCell>
                    <TableHeadCell className="w-1/5">Status</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {memberships.map(memberships => (
                    <TableRow key={memberships.personId}>
                        <TableCell>
                            <Link href={Paths.team(team.slug).members.person(memberships.personId).index} className="hover:underline">
                                {memberships.person.name}
                            </Link>
                        </TableCell>
                        <TableCell>{memberships.person.email}</TableCell>
                        <TableCell>{memberships.status}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Show>
}
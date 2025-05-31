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
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle, CardCollapseToggleButton } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'

import { AddTeamMemberDialog } from './add-team-member'
import { Popover, PopoverContent, PopoverTriggerButton } from '@/components/ui/popover'

/**
 * Card that displays the list of all team members and allows the user to add a new member.
 */
export function TeamMembersListCard() {
    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <AddTeamMemberDialog
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
            <CardCollapseToggleButton />
        </CardHeader>
        <CardBody boundary>
            <TeamMembersListTable />
        </CardBody>
    </Card>
}

function TeamMembersListTable() {
    const trpc = useTRPC()

    const { data: members } = useSuspenseQuery(trpc.currentTeam.members.queryOptions())

    return <Show
        when={members.length > 0}
        fallback={<Alert severity="info" title="No members defined">Add some members to get started.</Alert>}
    >
        <Table width="auto">
            <TableHead>
                <TableRow>
                    <TableHeadCell className="w-2/5">Name</TableHeadCell>
                    <TableHeadCell className="w-2/5">Email</TableHeadCell>
                    <TableHeadCell className="w-1/5">Role</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {members.map(member => (
                    <TableRow key={member.id}>
                        <TableCell>
                            <Link href={Paths.system.personnel.person(member.person.id).index} className="hover:underline">
                                {member.person.name}
                            </Link>
                        </TableCell>
                        <TableCell>{member.person.email}</TableCell>
                        <TableCell>{member.role}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Show>
}
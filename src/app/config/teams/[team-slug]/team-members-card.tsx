/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { TeamMembershipWithPerson, trpc } from '@/trpc/client'

import { AddTeamMemberDialog } from './add-team-member-dialog'



interface TeamMembersCardProps {
    teamId: string
}


export function TeamMembersCard({ teamId }: TeamMembersCardProps) {
    const teamMembershipsQuery = trpc.teamMemberships.byTeam.useQuery({ teamId })

    const teamMemberships = teamMembershipsQuery.data || []


    return <Card loading={teamMembershipsQuery.isLoading}>
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <AddTeamMemberDialog
                teamId={teamId}
                trigger={<DialogTriggerButton tooltip="Add Team Member"><PlusIcon/></DialogTriggerButton>}
            />
            
        </CardHeader>
        <CardContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Name</TableHeadCell>
                        <TableHeadCell>Role</TableHeadCell>
                        <TableHeadCell></TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {teamMemberships.map(membership =>
                        <TeamMembershipRow key={membership.id} membership={membership} />
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
}


function TeamMembershipRow({ membership}: { membership: TeamMembershipWithPerson }) {

    return <TableRow>
        <TableCell>
            <Link href={Paths.config.personnel.person(membership.person.id).index}>{membership.person.name}</Link>
        </TableCell>
        <TableCell>{membership.role}</TableCell>
        <TableCell className="text-right pr-0">
            <Button variant="ghost"><TrashIcon/></Button>
        </TableCell>
    </TableRow>
}
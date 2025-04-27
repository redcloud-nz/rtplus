/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'

import { AddTeamMemberDialog } from './add-team-member-dialog'
import { RemoveTeamMemberDialog } from './remove-team-member-dialog'
import { UpdateTeamMemberDialog } from './update-team-member-dialog'


interface TeamMembersCardProps {
    teamId: string
}

export function TeamMembersCard({ teamId }: TeamMembersCardProps) {
    const teamMembershipsQuery = trpc.teamMemberships.byTeam.useQuery({ teamId })

    const teamMemberships = teamMembershipsQuery.data || []

    const [deleteId, setDeleteId] = React.useState<string | null>(null)
    const [editId, setEditId] = React.useState<string | null>(null)

    return <>
        <Card loading={teamMembershipsQuery.isLoading}>
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
                            <TableRow key={membership.id}>
                                <TableCell>
                                    <Link href={Paths.system.personnel.person(membership.person.id).index}>{membership.person.name}</Link>
                                </TableCell>
                                <TableCell>{membership.role}</TableCell>
                                <TableCell className="w-24 px-0 text-right">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" onClick={() => setEditId(membership.id)}><PencilIcon/></Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit Membership</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" onClick={() => setDeleteId(membership.id)}><TrashIcon/></Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Remove Member</TooltipContent>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        { deleteId 
            ? <RemoveTeamMemberDialog
                teamMembership={teamMemberships.find(m => m.id === deleteId)!}
                open={!!deleteId}
                onOpenChange={newValue => setDeleteId(newValue ? deleteId : null)}
            /> 
            : null
        }
        { editId
            ? <UpdateTeamMemberDialog
                teamMembership={teamMemberships.find(m => m.id === editId)!}
                open={!!editId}
                onOpenChange={newValue => setEditId(newValue ? editId : null)}
            />
            : null
        }
    </>
}
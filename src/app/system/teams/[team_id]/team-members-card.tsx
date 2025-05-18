/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardActionButton, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'

import { AddTeamMemberDialog } from './add-team-member'
import { RemoveTeamMemberDialog } from './remove-team-member-dialog'
import { UpdateTeamMemberDialog } from './update-team-member-dialog'



export function TeamMembersCard({ teamId }: { teamId: string }) {
    const [addDialogOpen, setAddDialogOpen] = React.useState(false)

    return <Card>
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardActionButton
                    icon={<PlusIcon size={48}/>}
                    label="Add Team Member"
                    onClick={() => setAddDialogOpen(true)}
                />
        </CardHeader>
        <CardBody boundary>
            <TeamMembersCardInner teamId={teamId}/>
        </CardBody>
        <AddTeamMemberDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            teamId={teamId}
        />
    </Card>
}

function TeamMembersCardInner({ teamId }: { teamId: string }) {
    const trpc = useTRPC()
    const { data: teamMemberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))

    const [deleteId, setDeleteId] = React.useState<string | null>(null)
    const [editId, setEditId] = React.useState<string | null>(null)

    return <>
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
        
        { deleteId 
            ? <RemoveTeamMemberDialog open
                teamMembership={teamMemberships.find(m => m.id === deleteId)!}
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
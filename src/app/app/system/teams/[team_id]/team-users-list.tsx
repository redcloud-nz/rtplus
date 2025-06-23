/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information. 
 */
'use client'

import { format } from 'date-fns'

import { EllipsisVertical, PencilIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardCollapseToggleButton, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { OrgMembershipBasic, useTRPC } from '@/trpc/client'



export function TeamUsersCard_sys({ teamId }: { teamId: string }) {

    return <Card>
        <CardHeader>
            <CardTitle>Team Users</CardTitle>
            {/* <AddTeamMemberDialog
                teamId={teamId}
                trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Add Team Member">
                    <PlusIcon/>
                </DialogTriggerButton>}
            /> */}
            <CardExplanation>
                This card displays the users that have access to the team. You can edit or delete user assignments using the actions menu.
            </CardExplanation>
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <TeamUsersCardTable_sys teamId={teamId}/>
        </CardBody>
        
    </Card>
}

function TeamUsersCardTable_sys({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const { data: orgMemberships } = useSuspenseQuery(trpc.orgMemberships.byTeam.queryOptions({ teamId }))

    const [actionTarget, setActionTarget] = useState<{ action: 'Edit' | 'Delete', orgMembership: OrgMembershipBasic } | null>(null)

    return <Show
        when={orgMemberships.length > 0}
        fallback={<Alert severity="info" title="No users assigned to team"/>}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Identifier</TableHeadCell>
                    <TableHeadCell>Role</TableHeadCell>
                    <TableHeadCell>Created</TableHeadCell>
                    <TableCell className="w-10"></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {orgMemberships
                    .sort((a, b) => a.user.name.localeCompare(b.user.name))
                    .map(orgMembership => 
                        <TableRow key={orgMembership.id}>
                            <TableCell>{orgMembership.user.name}</TableCell>
                            <TableCell>{orgMembership.user.identifier}</TableCell>
                            <TableCell>{orgMembership.role}</TableCell>
                            <TableCell>{format(orgMembership.createdAt, "dd MMM yyyy")}</TableCell>
                            <TableCell className="w-10 p-0">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <span className="sr-only">Actions</span>
                                            <EllipsisVertical />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    
                                    <DropdownMenuContent align="end" className="w-32">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => setActionTarget({ action: 'Edit', orgMembership })}><PencilIcon/> Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setActionTarget({ action: 'Delete', orgMembership })}><TrashIcon/> Delete</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>
    </Show>
}
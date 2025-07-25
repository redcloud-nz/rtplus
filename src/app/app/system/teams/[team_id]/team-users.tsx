/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information. 
 */
'use client'

import { format } from 'date-fns'

import { EllipsisVertical, PencilIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { match } from 'ts-pattern'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { ObjectName } from '@/components/ui/typography'

import { OrgMembershipData } from '@/lib/schemas/org-membership'
import { TeamData } from '@/lib/schemas/team'
import { useTRPC } from '@/trpc/client'



type ActionState = { action: 'Edit' | 'Delete', orgMembership: OrgMembershipData } | null

export function TeamUsersCard({ team }: { team: TeamData }) {

    const [actionTarget, setActionTarget] = useState<ActionState>(null)
    function handleOpenChange(open: boolean) { if (!open) setActionTarget(null) }

    return <Sheet open={actionTarget != null} onOpenChange={handleOpenChange}>
        <Card>
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
            </CardHeader>
            <CardContent>
                <TeamUsersCardTable 
                    teamId={team.teamId}
                    onAction={setActionTarget}
                />
            </CardContent>
            
        </Card>
        <SheetContent>
            {match(actionTarget)
                .with({ action: 'Edit' }, ({ orgMembership }) => <>
                    <SheetHeader>
                        <SheetTitle>Edit User</SheetTitle>
                        <SheetDescription>Update the role or status of the user in relation to the team <ObjectName>{team.name}</ObjectName>.</SheetDescription>
                    </SheetHeader>
                    <SheetBody>
                        TODO
                    </SheetBody>
                </>)
                .with({ action: 'Delete' }, ({ orgMembership }) => <>
                    <SheetHeader>
                        <SheetTitle>Delete User</SheetTitle>
                        <SheetDescription>Remove the user's access from the team <ObjectName>{team.name}</ObjectName>.</SheetDescription>
                    </SheetHeader>
                    <SheetBody>
                        TODO
                    </SheetBody>
                </>)
                .otherwise(() => null)
            }
        </SheetContent>
    </Sheet>
}

function TeamUsersCardTable({ onAction, teamId }: { onAction: (args: ActionState) => void, teamId: string }) {
    const trpc = useTRPC()

    const { data: orgMemberships } = useSuspenseQuery(trpc.orgMemberships.byTeam.queryOptions({ teamId }))

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
                        <TableRow key={orgMembership.orgMembershipId} className="hover:bg-muted">
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
                                            <SheetTrigger asChild>
                                                <DropdownMenuItem onClick={() => onAction({ action: 'Edit', orgMembership })}><PencilIcon/> Edit</DropdownMenuItem>
                                            </SheetTrigger>
                                            <SheetTrigger asChild>
                                                <DropdownMenuItem onClick={() => onAction({ action: 'Delete', orgMembership })}><TrashIcon/> Delete</DropdownMenuItem>
                                            </SheetTrigger>
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
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { format } from 'date-fns'
import { EllipsisVertical, EllipsisVerticalIcon, FunnelIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { match } from 'ts-pattern'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardExplanation } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTriggerButton } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { OrgMembershipData } from '@/lib/schemas/org-membership'
import { useTRPC } from '@/trpc/client'

import { EditUserDialog } from './edit-user'
import { DeleteUserDialog } from './delete-user'





export function TeamUsersListCard({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.activeTeam.get.queryOptions())

    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <Popover>
                <PopoverTriggerButton variant="ghost" size="icon" tooltip="Filter users">
                    <FunnelIcon />
                </PopoverTriggerButton>
                <PopoverContent>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">Filters will be added here in the future.</p>
                        {/* Future filter options can be added here */}
                    </div>
                </PopoverContent>
            </Popover>
            <CardExplanation>
                <p>This card displays a list of users that have access to the team.</p>
                <p>To add a new user, you will need to invite them from the Invitations Card</p>
                <p>You can change a users role or delete them uing the <EllipsisVerticalIcon className="inline-block h-4 w-4"/> button to access the user action menu.</p>
            </CardExplanation>
        </CardHeader>
        <CardContent boundary>
            <TeamUsersListTable teamId={teamId}/>
        </CardContent>
    </Card>
}


function TeamUsersListTable({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const { data: orgMemberships } = useSuspenseQuery(trpc.orgMemberships.byTeam.queryOptions({ teamId }))

    const [actionTarget, setActionTarget] = useState<{ action: 'Edit' | 'Delete', orgMembership: OrgMembershipData } | null>(null)

    return <Show 
        when={orgMemberships.length > 0}
        fallback={<Alert severity="info" title="No users assigned to team" />}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Identifier</TableHeadCell>
                    <TableHeadCell>Role</TableHeadCell>
                    <TableHeadCell>Created</TableHeadCell>
                    <TableHeadCell className="w-10"></TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {orgMemberships
                    .map(orgMembership => 
                        <TableRow key={orgMembership.orgMembershipId}>
                            <TableCell>{orgMembership.user.name}</TableCell>
                            <TableCell>{orgMembership.user.identifier}</TableCell>
                            <TableCell>{orgMembership.role == 'org:admin' ? 'Admin' : 'Member'}</TableCell>
                            <TableCell>{format(orgMembership.createdAt, "dd MMM yyyy")}</TableCell>
                            <TableCell className="w-10 p-0">
                                <Protect role="org:admin">
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
                                                <DropdownMenuItem onClick={() => {}}><PencilIcon/> Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {}}><TrashIcon/> Delete</DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </Protect>
                            </TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>
        {/* {match(actionTarget)
            .with({ action: 'Edit' }, ({ orgMembership }) =>
                <EditUserDialog
                    key="edit-user-dialog"
                    orgMembership={orgMembership} 
                    open
                    onOpenChange={(open) => { if(!open) setActionTarget(null)}}
                />
            )
            .with({ action: 'Delete' }, ({ orgMembership }) => 
                <DeleteUserDialog 
                    key="delete-user-dialog"
                    orgMembership={orgMembership} 
                    open
                    onOpenChange={(open) => { if(!open) setActionTarget(null)}}
                />
            )
            .otherwise(() => null)
        } */}
    </Show>
    
    
}
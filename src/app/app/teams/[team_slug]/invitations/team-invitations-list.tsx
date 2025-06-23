/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { format } from 'date-fns'
import { EllipsisVerticalIcon, PlusIcon, SendIcon, UndoDotIcon } from 'lucide-react'
import { useState } from 'react'
import { match } from 'ts-pattern'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardCollapseToggleButton, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { OrgInvitationBasic, useTRPC } from '@/trpc/client'

import { CreateInvitationDialog } from './create-invitation'
import { RevokeInvitationDialog } from './revoke-invitation'



export function TeamInvitationsListCard() {
    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <Protect role="org:admin">
                <CreateInvitationDialog trigger={
                    <DialogTriggerButton variant="ghost" size="icon" tooltip="Create a new invitation">
                        <PlusIcon/>
                    </DialogTriggerButton>
                }/>
            </Protect>
            
            <CardExplanation>
                <p>This card displays a list of pending team invitations.</p>
                <p>To invite a new user, use the <PlusIcon className="inline-block h-4 w-4"/> button.</p>
                <p>You can resend or revoke and invite using the <EllipsisVerticalIcon className="inline-block h-4 w-4"/> button to access the invitation action menu.</p>
            </CardExplanation>
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <TeamInvitationsListTable/>
        </CardBody>
    </Card>
}

function TeamInvitationsListTable() {
    const trpc = useTRPC()

    const { data: invitations } = useSuspenseQuery(trpc.orgInvitations.byCurrentTeam.queryOptions())

    const [actionTarget, setActionTarget] = useState<{ action: 'Resend' | 'Revoke', orgInvitation: OrgInvitationBasic } | null>(null)

    return <Show 
        when={invitations.length > 0}
        fallback={<Alert severity="info" title="No pending invitations." />}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Email</TableHeadCell>
                    <TableHeadCell>Role</TableHeadCell>
                    <TableHeadCell>Created</TableHeadCell>
                    <TableHeadCell className="w-10"></TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {invitations.map(orgInvitation => (
                    <TableRow key={orgInvitation.id}>
                        <TableCell>{orgInvitation.email}</TableCell>
                        <TableCell>{orgInvitation.role}</TableCell>
                        <TableCell>{format(orgInvitation.createdAt, 'dd MMM yyyy')}</TableCell>
                        <TableCell className="w-10 p-0">
                            <Protect role="org:admin">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <span className="sr-only">Actions</span>
                                            <EllipsisVerticalIcon/>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    
                                    <DropdownMenuContent align="end" className="w-36">
                                        <DropdownMenuLabel>Invitation Actions</DropdownMenuLabel>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => setActionTarget({ action: 'Resend', orgInvitation })} disabled><SendIcon/> Resend</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setActionTarget({ action: 'Revoke', orgInvitation })}><UndoDotIcon/> Revoke</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </Protect>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        {match(actionTarget)
            .with({ action: 'Revoke' }, ({ orgInvitation }) => 
                <RevokeInvitationDialog 
                    orgInvitation={orgInvitation} 
                    onOpenChange={open => {
                        if(!open) setActionTarget(null)
                    }} 
                />
            )
            .otherwise(() => null)
        }
    </Show>
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { format } from 'date-fns'
import { PlusIcon, SendIcon, TrashIcon } from 'lucide-react'
import { useMemo} from 'react'

import { Protect } from '@clerk/nextjs'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { ConfirmPopupButton, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'

import { useToast } from '@/hooks/use-toast'
import { InvitationStatus, InvitationStatusNameMap, TeamInvitationData } from '@/lib/schemas/invitation'
import { UserRole, UserRoleNameMap } from '@/lib/schemas/user'
import { useTRPC } from '@/trpc/client'

import { CreateInvitationDialog } from './create-invitation'




/**
 * A card that displays a list of pending team invitations.
 * This card allows users to manage invitations by resending or revoking them.
 */
export function ActiveTeam_Invitations_ListCard() {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: invitations } = useSuspenseQuery(trpc.activeTeam.invitations.all.queryOptions({}))

    async function handleRefresh() {
        await queryClient.invalidateQueries(trpc.activeTeam.invitations.all.queryFilter())
    }

    const resendMutation = useMutation(trpc.activeTeam.invitations.resend.mutationOptions({
        onError(error) {
            toast({
                title: "Error resending invitation",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(invitation) {
            toast({
                title: "Invitation resent",
                description: `The invitation to '${invitation.email}' has been successfully resent.`,
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.activeTeam.invitations.all.queryFilter())
        }
    }))

    const revokeMutation = useMutation(trpc.activeTeam.invitations.revoke.mutationOptions({
        onError(error) {
            toast({
                title: "Error revoking invitation",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess(invitation) {
            toast({
                title: "Invitation revoked",
                description: `The invitation to '${invitation.email}' has been successfully revoked.`,
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.activeTeam.invitations.all.queryFilter())
        }
    }))

    const columns = useMemo(() => defineColumns<TeamInvitationData>(columnHelper => [
        columnHelper.accessor('email', {
            header: 'Email',
            cell: ctx => ctx.getValue(), 
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('role', {
            header: 'Role',
             cell: ctx => UserRoleNameMap[ctx.getValue() as UserRole],
            enableGrouping: true,
            enableHiding: false,
            enableSorting: false,
            enableGlobalFilter: false,
            meta: {
                enumOptions: UserRoleNameMap
            }
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => InvitationStatusNameMap[info.getValue() as InvitationStatus],
            enableGrouping: true,
            enableHiding: false,
            enableSorting: false,
            enableGlobalFilter: false,
            meta: {
                enumOptions: InvitationStatusNameMap
            }
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: info => format(info.getValue(), 'dd MMM yyyy'),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('updatedAt', {
            header: 'Updated',
            cell: info => format(info.getValue(), 'dd MMM yyyy'),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('expiresAt', {
            header: 'Expires',
            cell: info => format(info.getValue(), 'dd MMM yyyy'),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ctx => <Protect role="org:admin">
                <div className="-m-2 flex items-center justify-end">
                    <ConfirmPopupButton 
                        slotProps={{
                            confirmButton: {
                                onClick: () => resendMutation.mutate({ invitationId: ctx.row.original.invitationId }),
                                children: 'Resend',
                            },
                        }}
                        tooltip="Resend invitation"
                        disabled={ctx.row.original.status !== 'pending'}
                    >
                        <SendIcon/>
                        <span className="sr-only">Revoke</span>
                    </ConfirmPopupButton>
                    <ConfirmPopupButton 
                        slotProps={{
                            confirmButton: {
                                onClick: () => revokeMutation.mutate({ invitationId: ctx.row.original.invitationId }),
                                children: 'Revoke',
                            },
                        }}
                        tooltip="Revoke invitation"
                        disabled={ctx.row.original.status !== 'pending'}
                    >
                        <TrashIcon/>
                        <span className="sr-only">Revoke</span>
                    </ConfirmPopupButton>
                </div>
            </Protect>,
            enableHiding: false,
            enableSorting: false,
            meta: {
                slotProps: {
                    th: {
                        className: 'w-20'
                    }
                }
            }
        })
    ]), [resendMutation, revokeMutation])

    const table = useReactTable<TeamInvitationData>({
        data: invitations,
        columns,
         getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowId: (row) => row.invitationId,
        initialState: {
            columnVisibility: {
                email: true, role: true, status: true, expiresAt: true, createdAt: false, updatedAt: false, actions: true
            },
            columnFilters: [],
            sorting: [{ id: 'createdAt', desc: true }],
            globalFilter: '',
            
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <DataTableSearch size="sm" variant="ghost"/>
                <CardActions>
                    <Protect role="org:admin">
                        <CreateInvitationDialog trigger={
                            <DialogTriggerButton variant="ghost" size="icon" tooltip="Create a new invitation">
                                <PlusIcon/>
                            </DialogTriggerButton>
                        }/>
                    </Protect>
                    <RefreshButton onClick={handleRefresh}/>
                    <TableOptionsDropdown/>
                    <Separator orientation="vertical"/>
                    <CardExplanation>
                        <p>This card displays a list of pending team invitations.</p>
                        <p>To invite a new user, use the <PlusIcon className="inline-block h-4 w-4"/> button.</p>
                        <p>You can resend an invitation with the <SendIcon className="inline-block h-4 w-4"/> button.</p>
                        <p>You can revoke an invitation with the <TrashIcon className="inline-block h-4 w-4"/> button.</p>
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <Table className="table-fixed">
                    <DataTableHead/>
                    <DataTableBody/>
                    <DataTableFooter/>
                </Table>
            </CardContent>
        </Card>
    </DataTableProvider>
}
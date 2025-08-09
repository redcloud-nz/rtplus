/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { format } from 'date-fns'
import {  PencilIcon, SaveIcon, TrashIcon, XIcon } from 'lucide-react'
import { useMemo } from 'react'
import { match } from 'ts-pattern'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button, DeleteConfirmButton, RefreshButton } from '@/components/ui/button'
import { Card, CardContent, CardHeader,  CardExplanation, CardActions } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { TextLink } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'

import { useToast } from '@/hooks/use-toast'
import { EditableFeature } from '@/lib/editable-feature'
import { UserData2, UserRole, UserRoleNameMap } from '@/lib/schemas/user'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


/**
 * A card that displays the list of all users in the active team.
 * This card is used to manage users and their roles within the team.
 */
export function ActiveTeam_Users_ListCard() {
    const queryClient = useQueryClient()
    const { toast} = useToast()
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.activeTeam.getTeam.queryOptions())
    const { data: users } = useSuspenseQuery(trpc.activeTeam.users.getUsers.queryOptions())

    async function handleRefresh() {
        await queryClient.invalidateQueries(trpc.activeTeam.users.getUsers.queryFilter())
    }

    const updateMutation = useMutation(trpc.activeTeam.users.updateUser.mutationOptions({
        onError(error) {
            toast({
                title: "Error updating user",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess() {
            toast({
                title: "User updated",
                description: "The user has been successfully updated.",
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.activeTeam.users.getUsers.queryFilter())
        }
    }))

    const deleteMutation = useMutation(trpc.activeTeam.users.deleteUser.mutationOptions({
        onError(error) {
            toast({
                title: "Error deleting user",
                description: error.message,
                variant: 'destructive',
            })
        },
        onSuccess() {
            toast({
                title: "User deleted",
                description: "The user has been successfully deleted.",
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.activeTeam.users.getUsers.queryFilter())
        }
    }))

    const columns = useMemo(() => defineColumns<UserData2>(columnHelper => [
        columnHelper.accessor('personId', {
            header: "Person ID",
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('name', {
            header: "Name",
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,
        }),
        columnHelper.accessor('email', {
           
            header: "Email",
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,
        }),
        columnHelper.accessor('role', {
            id: "role",
            header: "Role",
            cell: ctx => (match(ctx.row.getEditMode())
                .with('Update', () => 
                    <Select
                        value={ctx.row.getModifiedRowData().role}
                        onValueChange={value => ctx.row.setModifiedRowData({ role: value as UserRole })}
                    >
                        <SelectTrigger size="sm" className="-m-2">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(UserRoleNameMap).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        
                    </Select>
                )
                .otherwise(() => UserRoleNameMap[ctx.getValue() as UserRole])
            ),
            enableGrouping: true,
            enableHiding: false,
            enableSorting: true,
            meta: {
                enumOptions: UserRoleNameMap,
            }
        }),
        columnHelper.accessor('lastActiveAt', {
            header: "Last Active",
            cell: ctx => format(ctx.getValue(), 'dd MMM yyyy'),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('createdAt', {
            id: "createdAt",
            header: "Created At",
            cell: ctx => format(ctx.getValue(), 'dd MMM yyyy'),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ctx => <div className="-m-2 flex items-center justify-end">
                {match(ctx.row.getEditMode())
                    .with('Create', 'Update', () => <>
                        <Button variant="ghost" size="icon" onClick={() => ctx.row.saveEdit()}>
                            <SaveIcon/>
                            <span className="sr-only">Save</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                            ctx.row.cancelEdit()
                        }}>
                            <XIcon/>
                            <span className="sr-only">Cancel</span>
                        </Button>
                    </>)
                    .with('View', () => <>
                        <Button variant="ghost" size="icon" onClick={() => ctx.row.startEdit()}>
                            <PencilIcon/>
                            <span className="sr-only">Edit</span>
                        </Button>
                        <DeleteConfirmButton onDelete={() => ctx.row.delete()}/>
                       
                    </>)
                    .exhaustive()
                }
            </div>,
            enableGrouping: false,
            enableHiding: false,
            enableSorting: false,
            meta: {
                slotProps: {
                    th: {
                        className: 'w-20',
                    }
                }
            }
        })
    ]), [])

    const table = useReactTable<UserData2>({
        _features: [EditableFeature()],
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowId: (row) => row.personId,
        onUpdate: (row) => {
            updateMutation.mutate(row)
        },
        onDelete: (rowData) => {
            deleteMutation.mutate(rowData)
        },
        initialState: {
            columnVisibility: {
                personId: false, name: true, email: true, role: true, lastActiveAt: true, createdAt: false
            },
            columnFilters: [],
            globalFilter: "",
            grouping: [],
            sorting: [{ id: 'name', desc: false }],
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <DataTableSearch size="sm" variant="ghost"/>
                <CardActions>
                    <RefreshButton onClick={handleRefresh}/>
                     <TableOptionsDropdown/>
                     <Separator orientation='vertical'/>
                     <CardExplanation>
                        <p>This card displays a list of users that have access to the team.</p>
                        <p>To add a new user, you will need to invite them from the <TextLink href={Paths.team(team.slug).invitations.index}>Invitations</TextLink> page.</p>
                        <p>You can change a users role uing the <PencilIcon className="inline-block h-4 w-4"/> button.</p>
                        <p>You can remove a user using the <TrashIcon className="inline-block h-4 w-5"/> button.</p>
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
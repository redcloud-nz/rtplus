/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-react'
import { useMemo } from 'react'
import { match } from 'ts-pattern'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button, DeleteConfirmButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'

import { D4H_ACCESS_TOKENS_QUERY_KEY, D4hAccessTokenData, getAccessTokens, removeAccessToken, updateAccessToken } from '@/lib/d4h-access-tokens'
import { getD4hServer } from '@/lib/d4h-api/servers'
import { EditableFeature } from '@/lib/editable-feature'
import { formatDateTime } from '@/lib/utils'

import { AddAccessTokenDialog } from './add-access-token'



export function AccessTokenListCard() {
    const queryClient = useQueryClient()

    const accessTokenQuery = useQuery({ 
        queryKey: D4H_ACCESS_TOKENS_QUERY_KEY, 
        queryFn: getAccessTokens
    })

    const columns = useMemo(() => defineColumns<D4hAccessTokenData>(columnHelper => [
        columnHelper.accessor('label', {
            header: 'Label',
            cell: ctx => (match(ctx.row.getEditMode())
                .with('Update', () => 
                    <Input 
                        value={ctx.row.getModifiedRowData().label} 
                        onChange={ev => ctx.row.setModifiedRowData({ label: ev.target.value })}
                    />
                )
                .otherwise(() => ctx.getValue())
            ),
            enableHiding: false,
            enableSorting: true,
            enableGlobalFilter: true,
        }),
        columnHelper.accessor('serverCode', {
            header: 'D4H Server',
            cell: ctx => getD4hServer(ctx.getValue()).name,
            enableHiding: true,
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created At',
            cell: ctx => formatDateTime(ctx.getValue()),
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('teams', {
            header: 'D4H Teams',
            cell: ctx => <>
                {ctx.row.original.teams.map(team => <div key={team.id}>{team.name}</div>)}
            </>,
            enableHiding: true,
            enableSorting: false,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ctx => <div className="-m-2 flex items-center justify-end">
                {match(ctx.row.getEditMode())
                    .with('Update', () => <>
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
                    .otherwise(() => <>
                        <Button variant="ghost" size="icon" onClick={() => ctx.row.startEdit()}>
                            <PencilIcon/>
                            <span className="sr-only">Edit</span>
                        </Button>
                        <DeleteConfirmButton onDelete={() => ctx.row.delete()}/>
                       
                    </>)
                }
            </div>,
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
    ]), [])

    const table = useReactTable<D4hAccessTokenData>({
        _features: [EditableFeature()],
        columns,
        data: accessTokenQuery.data || [],
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowId: (row) => row.id,
        onUpdate: (rowData) => {
            updateAccessToken(rowData.id, rowData)
            queryClient.invalidateQueries({ queryKey: D4H_ACCESS_TOKENS_QUERY_KEY })
        },
        onDelete: (rowData) => {
            removeAccessToken(rowData.id)
            queryClient.invalidateQueries({ queryKey: D4H_ACCESS_TOKENS_QUERY_KEY })
        },
        enableGrouping: false,
        initialState: {
            columnVisibility: {
                label: true, serverCode: true, createdAt: true, teams: true, actions: true
            },
            sorting: [{ id: 'createdAt', desc: true }],
        }
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <DataTableSearch size="sm" variant="ghost" placeholder="Search access tokens..." />
                <CardActions>
                    <AddAccessTokenDialog>
                        <Button variant="ghost" size="icon">
                            <PlusIcon />
                        </Button>
                    </AddAccessTokenDialog>

                    <TableOptionsDropdown/>
                    <Separator orientation="vertical"/>
                    <CardExplanation>
                        This card lists the personal D4H access tokens that you have configured for use on this device.
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <Table>
                    <DataTableHead/>
                    <DataTableBody/>
                    <DataTableFooter/>
                </Table>
            </CardContent>
        </Card>
    </DataTableProvider>
    
    
}
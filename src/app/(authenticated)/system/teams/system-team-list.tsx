/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTableFooter, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Table } from '@/components/ui/table'

import { TeamData } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


type RowData = TeamData & { _count: { teamMemberships: number } }

export function System_TeamsList_Card() {

    const trpc = useTRPC()

    const teamsQuery = useSuspenseQuery(trpc.teams.getTeams.queryOptions({}))

    async function handleRefresh() {
        await teamsQuery.refetch()
    }

    const columns = useMemo(() => defineColumns<RowData>(columnHelper => [
    columnHelper.accessor('teamId', {
        header: 'ID',
        cell: ctx => ctx.getValue(),
        enableHiding: true,
        enableSorting: false,
        enableGlobalFilter: false,
    }),
    columnHelper.accessor('name', {
        header: 'Name',
        cell: ctx => <TextLink to={Paths.system.team(ctx.row.original.teamId)}>{ctx.getValue()}</TextLink>,
        enableHiding: false
    }),
    columnHelper.accessor('shortName', {
        header: 'Short Name',
        cell: ctx => ctx.getValue(),
        enableGrouping: false,
    }),
    columnHelper.accessor('_count.teamMemberships', {
        id: 'teamMemberCount',
        header: 'Members',
        cell: ctx => ctx.getValue(),
        enableSorting: true,
        enableGlobalFilter: false,
    }),
    columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        cell: ctx => ctx.getValue(),
        enableSorting: false,
        enableGlobalFilter: false,
        filterFn: 'arrIncludesSome',
        meta: {
            enumOptions: { Active: 'Active', Inactive: 'Inactive' },
        }
    }),
]), [])

    const table = useReactTable<RowData>({
        columns,
        data: teamsQuery.data,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            columnVisibility: {
                teamId: false, name: true, shortName: true, teamMemberCount: true, status: true
            },
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ],
            globalFilter: "",
            grouping: [],
            sorting: [
                { id: 'name', desc: false }
            ],
            pagination: {
                pageIndex: 0,
                pageSize: 20
            },
        }
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <DataTableSearch size="sm" variant="ghost"/>
                <CardActions>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                                <Link to={Paths.system.teams.create}>
                                    <PlusIcon />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Create new team
                        </TooltipContent>
                    </Tooltip>

                    <RefreshButton onClick={handleRefresh}/>
                    <TableOptionsDropdown/>
                    <Separator orientation="vertical"/>

                    <CardExplanation>
                        This is a list of all the teams in the system.
                    </CardExplanation>
                    
                    
                </CardActions>
                
            </CardHeader>
            <CardContent>
                <Table>
                    <DataTableHead/>
                    <DataTableBody/>
                    <DataTableFooter variant="pagination"/>
                </Table>
            </CardContent>
        </Card>
    </DataTableProvider>
}
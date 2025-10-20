/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Show } from '@/components/show'
import { Button, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTableFooter, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Table } from '@/components/ui/table'
import { Paragraph } from '@/components/ui/typography'

import { TeamData } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'







type RowData = TeamData & { _count: { teamMemberships: number } }

export function AdminModule_TeamsList() {

    const { data: teams, refetch } = useSuspenseQuery(trpc.teams.getTeams.queryOptions({}))

    async function handleRefresh() {
        await refetch()
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
        cell: ctx => <TextLink to={Paths.adminModule.team(ctx.row.original.teamId)}>{ctx.getValue()}</TextLink>,
        enableHiding: false
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
        data: teams,
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

    return <Show 
        when={teams.length > 0} 
        fallback={<Empty>
            <EmptyHeader>
                <EmptyMedia>
                </EmptyMedia>
                <EmptyTitle>No Personnel Yet</EmptyTitle>
                <EmptyDescription>
                    You haven't added any personnel to your organisation.
                    <Protect role="org:admin" fallback="Ask your administrator to add one.">Get started by adding one.</Protect>
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Protect role="org:admin">
                    <Button asChild>
                        <Link to={Paths.adminModule.teams.create}>
                            <PlusIcon className="mr-2 h-4 w-4"/>
                            Add Team
                        </Link>
                    </Button>
                </Protect>
            </EmptyContent>
        </Empty>}
    >
        <DataTableProvider value={table}>
            <Card>
                <CardHeader>
                    <DataTableSearch size="sm" variant="ghost"/>
                    <CardActions>
                        <Protect role="org:admin">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link to={Paths.adminModule.teams.create}>
                                            <PlusIcon />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Create New Team
                                </TooltipContent>
                            </Tooltip>
                        </Protect>
                        

                        <RefreshButton onClick={handleRefresh}/>
                        <TableOptionsDropdown/>
                        <Separator orientation="vertical"/>

                        <CardExplanation>
                            <Paragraph>This is a list of all the teams in your organisation.</Paragraph>
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
    </Show>
    
}
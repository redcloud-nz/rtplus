/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Link } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function MySessionsList_Card() {
    const router = useRouter()
    const trpc = useTRPC()

    const sessionsQuery = useSuspenseQuery(trpc.activeTeam.skillCheckSessions.getTeamSessions.queryOptions())

    async function handleRefresh() {
        await sessionsQuery.refetch()
    }

    const columns = useMemo(() => defineColumns<typeof sessionsQuery.data[0]>(columnHelper => [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: ctx => <Link href={Paths.competencies.session(ctx.row.original.sessionId).index}>{ctx.getValue()}</Link>,
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,
        }),
        columnHelper.accessor('date', {
            header: 'Date',
            cell: ctx => formatISO(new Date(ctx.getValue()), { representation: 'date' }),
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,
        }),
        columnHelper.accessor('_count.assessees', {
            id: 'assessees',
            header: 'Assessees',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('_count.assessors', {
            id: 'assessors',
            header: 'Assessors',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('_count.skills', {
            id: 'skills',
            header: 'Skills',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('_count.checks', {
            id: 'checks',
            header: 'Checks',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('sessionStatus', {
            id: 'status',
            header: 'Status',
            cell: ctx => ctx.getValue(),
            enableGrouping: true,
            enableHiding: true,
            enableSorting: true,
        }),
    ]), [])

    const table = useReactTable({
        data: sessionsQuery.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            columnVisibility: {
                name: true, date: true, skills: true, assessees: true, checks: true, assessors: true, status: true
            },
            columnFilters: [],
            grouping: [],
            sorting: [{ id: 'date', desc: true }],
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <DataTableSearch size="sm" variant="ghost"/>
                <CardActions>
                    <RefreshButton onClick={handleRefresh} />
                    <TableOptionsDropdown/>
                    <Separator orientation='vertical'/>
                    <CardExplanation>
                        This is a list of all of the draft skill check sessions that you have been assigned to (as a assessor).
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
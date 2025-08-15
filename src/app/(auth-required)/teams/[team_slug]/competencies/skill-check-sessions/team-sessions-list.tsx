/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button, RefreshButton} from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Link } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'

import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function Team_SkillCheckSessionsList_Card() {
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.activeTeam.getTeam.queryOptions())
    const sessionsQuery = useSuspenseQuery(trpc.activeTeam.skillCheckSessions.getTeamSessions.queryOptions())

    async function handleRefresh() {
        await sessionsQuery.refetch()
    }

    const columns = useMemo(() => defineColumns<SkillCheckSessionData>(columnHelper => [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: ctx => <Link href={Paths.team(team).competencies.session(ctx.row.original.sessionId).index}>{ctx.getValue()}</Link>,
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
    ]), [team])

    const table = useReactTable({
        data: sessionsQuery.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            columnVisibility: {
                name: true, date: true, skills: true, assessees: true, checks: true, assessors: true, status: true
            },
            columnFilters: [],
            grouping: [],
            pagination: { pageIndex: 0, pageSize: 50 },
            sorting: [{ id: 'date', desc: true }],
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <DataTableSearch size="sm" variant="ghost"/>
                <CardActions>
                    <Protect role="org:admin">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={Paths.team(team.slug).competencies.sessions.create}>
                                <PlusIcon/>
                            </Link>
                        </Button>
                    </Protect>
                    <RefreshButton onClick={handleRefresh} />
                    <TableOptionsDropdown/>
                    <Separator orientation='vertical'/>
                    <CardExplanation>
                        This is a list of all skill check sessions for the team. You can create new sessions or view existing ones.
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <Table className="table-fixed">
                    <DataTableHead/>
                    <DataTableBody/>
                    <DataTableFooter variant="pagination"/>
                </Table>
            </CardContent>
        </Card>
    </DataTableProvider>
}
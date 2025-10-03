/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { formatISO } from 'date-fns'
import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button, RefreshButton} from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useIsMobile } from '@/hooks/use-mobile'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { TeamData } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function Team_Skills_SessionList_Card({ team }: { team: TeamData }) {

    const sessionsQuery = useSuspenseQuery(trpc.skillChecks.getTeamSessions.queryOptions({ teamId: team.teamId }))

    async function handleRefresh() {
        await sessionsQuery.refetch()
    }

    const isMobile = useIsMobile()

    const columns = useMemo(() => defineColumns<SkillCheckSessionData>(columnHelper => [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: ctx => <TextLink to={Paths.tools.skillRecorder.session(ctx.row.original.sessionId)}>{ctx.getValue()}</TextLink>,
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
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            columnVisibility: {
                name: true, date: true, skills: isMobile, assessees: isMobile, checks: isMobile, assessors: isMobile, status: true
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
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                                <Link to={Paths.team(team).skills.sessions.create}>
                                    <PlusIcon/>
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Create a new skill check session for the team.
                        </TooltipContent>
                    </Tooltip>
                        
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
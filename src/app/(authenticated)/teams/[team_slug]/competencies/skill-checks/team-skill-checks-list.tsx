/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'

import { CompetenceLevel, CompetenceLevelTerms } from '@/lib/competencies'
import { PersonData } from '@/lib/schemas/person'
import { SkillCheckData } from '@/lib/schemas/skill-check'
import { SkillData } from '@/lib/schemas/skill'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


type RowData = SkillCheckData & { assessee: PersonData, assessor: PersonData, skill: SkillData }

export function Team_SkillChecksList_Card() {
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.activeTeam.getTeam.queryOptions())
    const checksQuery = useSuspenseQuery(trpc.activeTeam.skillChecks.getSkillChecks.queryOptions({}))

    async function handleRefresh() {
        await checksQuery.refetch()
    }

    const columns = useMemo(() => defineColumns<RowData>(columnHelper => [
        columnHelper.accessor('skillCheckId', {
            header: 'Record ID',
            cell: info => info.getValue(),
            
            enableGrouping: false,
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('assessee.name', {
            id: 'assessee',
            header: 'Assessee',
            cell: ctx => <TextLink href={Paths.team(team.slug).member(ctx.row.original.assesseeId).href}>{ctx.getValue()}</TextLink>,
            enableGrouping: true,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('assessor.name', {
            id: 'assessor',
            header: 'Assessor',
            cell: ctx => <TextLink href={Paths.team(team.slug).member(ctx.row.original.assessorId).href}>{ctx.getValue()}</TextLink>,
            enableGrouping: true,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('skill.name', {
            id: 'skill',
            header: 'Skill',
            cell: ctx => ctx.getValue(),
            enableGrouping: true,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('result', {
            header: 'Result',
            cell: ctx => CompetenceLevelTerms[ctx.getValue() as CompetenceLevel] || ctx.getValue(),
            enableGrouping: true,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('date', {
            id: 'date',
            header: 'Date',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
    ]), [team])

    const table = useReactTable<RowData>({
        columns,
        data: checksQuery.data,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            columnVisibility: {
                skillCheckId: false, assessee: true, assessor: true, skill: true, result: true, date: true,
            },
            columnFilters: [],
            globalFilter: '',
            grouping: [],
            pagination: {
                pageIndex: 0,
                pageSize: 50,
            },
            sorting: [
                { id: 'date', desc: true },
            ]
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <DataTableSearch size="sm" variant="ghost"/>
                <CardActions>
                    <RefreshButton onClick={handleRefresh}/>
                    <TableOptionsDropdown/>
                    
                    <Separator orientation="vertical"/>

                    <CardExplanation>
                        This card displays the list of skill checks recorded for the active team. 
                        You can filter, sort, and search through the records.
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
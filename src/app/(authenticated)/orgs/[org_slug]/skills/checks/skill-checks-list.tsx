/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import Artie from '@/components/art/artie'
import { Show } from '@/components/show'
import { Button, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip'

import { CompetenceLevel, CompetenceLevelTerms } from '@/lib/competencies'
import { OrganizationData } from '@/lib/schemas/organization'
import { PersonRef } from '@/lib/schemas/person'
import { SkillCheckData } from '@/lib/schemas/skill-check'
import { SkillData } from '@/lib/schemas/skill'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



type RowData = SkillCheckData & { assessee: PersonRef, assessor: PersonRef, skill: SkillData }

export function SkillsModule_SkillChecks_List({ organization }: { organization: OrganizationData }) {

    const { data: checks, refetch: checksRefetch } = useSuspenseQuery(trpc.skillChecks.getSkillChecks.queryOptions({ orgId: organization.orgId }))

    async function handleRefresh() {
        await checksRefetch()
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
            cell: ctx => <TextLink to={Paths.org(organization.slug).admin.person(ctx.row.original.assesseeId)}>
                {ctx.getValue()}
            </TextLink>,
            enableGrouping: true,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('assessor.name', {
            id: 'assessor',
            header: 'Assessor',
            cell: ctx => <TextLink to={Paths.org(organization.slug).admin.person(ctx.row.original.assessorId)}>
                {ctx.getValue()}
            </TextLink>,
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
    ]), [])

    const table = useReactTable<RowData>({
        columns,
        data: checks,
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

    return <Show 
        when={checks.length > 0} 
        fallback={<Empty>
            <EmptyHeader>
                <EmptyMedia>
                    <Artie pose="Empty"/>
                </EmptyMedia>
                <EmptyTitle>No Checks Recorded</EmptyTitle>
                <EmptyDescription>
                    Your organisation has not recorded any skill checks yet.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button asChild>
                    <Link to={Paths.org(organization.slug).skills.checks.create}>
                        <PlusIcon className="mr-2 h-4 w-4"/>
                        Record Check
                    </Link>
                </Button>
            </EmptyContent>
        </Empty>}
    >
        <DataTableProvider value={table}>
            <Card>
                <CardHeader>
                    <DataTableSearch size="sm" variant="ghost"/>
                    <CardActions>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link to={Paths.org(organization.slug).skills.checks.create}>
                                        <PlusIcon />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                        </Tooltip>
                        
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
    </Show>
    
    
}
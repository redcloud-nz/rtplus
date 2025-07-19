/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel,  getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Table } from '@/components/ui/table'

import * as Paths from '@/paths'
import { SkillWithGroup, useTRPC } from '@/trpc/client'



export function SkillPackageSkillsListCard({ skillPackageId }: { skillPackageId: string }) {
    const trpc = useTRPC()

    const { data: skills } = useSuspenseQuery(trpc.skills.bySkillPackageId.queryOptions({ skillPackageId }))

    const columns = useMemo(() => defineColumns<SkillWithGroup>(columnHelper => [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: ctx => ctx.getValue(),
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
            enableGrouping: false,
        }),
        columnHelper.accessor('name', {
            header: 'Skill',
            cell: ctx => <TextLink href={Paths.system.skillPackage(skillPackageId).skill(ctx.row.original.id).index}>{ctx.getValue()}</TextLink>,
            enableGrouping: false,
            enableHiding: false
        }),
         columnHelper.accessor('skillGroup.name', {
            header: 'Group',
            cell: ctx => <TextLink href={Paths.system.skillPackage(skillPackageId).group(ctx.row.original.skillGroupId).index}>{ctx.getValue()}</TextLink>,
            enableHiding: false
        }),
        columnHelper.accessor('description', {
            header: 'Description',
            cell: ctx => ctx.getValue() || <i className="text-muted-foreground">No description</i>,
            enableHiding: true,
            enableSorting: false,
            enableGrouping: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('frequency', {
            header: 'Frequency',
            cell: ctx => ctx.getValue() || <i className="text-muted-foreground">Not set</i>,
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: ctx => ctx.getValue(),
            enableSorting: false,
            enableGlobalFilter: false,
            filterFn: 'arrIncludesSome',
            meta: {
                enumOptions: { Active: 'Active', Inactive: 'Inactive' },
            }
        }),
    ]), [skillPackageId])

    const table = useReactTable({
        columns,
        data: skills,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: {
            columnVisibility: {
                id: false, 'skillGroupId': true, name: true, description: true, frequency: false, status: true
            },
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ],
            globalFilter: '',
            grouping: [],
            sorting: [
                { id: 'name', desc: false }
            ],
        }
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardActions>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={Paths.system.skillPackage(skillPackageId).skills.create}>
                                    <PlusIcon/>
                                </Link>
                                
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Add new skill
                        </TooltipContent>
                    </Tooltip>

                    <CardExplanation>
                        Skills are the individual abilities or tasks that can be performed within a skill package. You can create, edit, and delete skills as needed.
                    </CardExplanation>
                     <Separator orientation="vertical"/>


                    <TableOptionsDropdown/>
                </CardActions>
            </CardHeader>
            <CardContent>
                <DataTableSearch className="mb-1"/>
                <Table>
                    <DataTableHead />
                    <DataTableBody />
                </Table>
            </CardContent>
        </Card>
    </DataTableProvider>
}
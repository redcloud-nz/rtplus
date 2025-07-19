/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTablePaginationFooter, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { SkillPackage, useTRPC, WithCounts } from '@/trpc/client'



const columns = defineColumns<WithCounts<SkillPackage, 'skills' | 'skillGroups'>>(columnHelper => [
    columnHelper.accessor('id', {
        header: 'ID',
        cell: ctx => ctx.getValue(),
        enableHiding: true,
        enableSorting: false,
        enableGlobalFilter: false,
    }),
    columnHelper.accessor('name', {
        header: 'Name',
        cell: ctx => <TextLink href={Paths.system.skillPackage(ctx.row.original.id).index}>{ctx.getValue()}</TextLink>,
        enableHiding: false
    }),
    columnHelper.accessor('_count.skillGroups', {
        header: 'Groups',
        cell: ctx => ctx.getValue(),
        enableGrouping: false,
        enableSorting: true,
        enableGlobalFilter: false,
    }),
    columnHelper.accessor('_count.skills', {
        header: 'Skills',
        cell: ctx => ctx.getValue(),
        enableGrouping: false,
        enableSorting: true,
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
])


export function SkillPackageListCard() {
    const trpc = useTRPC()

    const { data: skillPackages } = useSuspenseQuery(trpc.skillPackages.all.queryOptions({ status: ['Active', 'Inactive'] }))

    const table = useReactTable({
            columns,
            data: skillPackages,
            getCoreRowModel: getCoreRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getGroupedRowModel: getGroupedRowModel(),
            getExpandedRowModel: getExpandedRowModel(),
            initialState: {
                columnVisibility: {
                    id: false, name: true, skillGroups: true, skills: true, status: true
                },
                columnFilters: [
                    { id: 'status', value: ['Active'] }
                ],
                globalFilter: "",
                grouping: [],
                sorting: [
                    { id: 'name', desc: false }
                ],
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
                                    <Link href={Paths.system.skillPackages.create}>
                                        <PlusIcon />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Create new skill package
                            </TooltipContent>
                        </Tooltip>
                        
                        <CardExplanation>
                            This is a list of all the available skill packages in the system.
                        </CardExplanation>
                        <Separator orientation="vertical"/>
    
                        <TableOptionsDropdown/>
                    </CardActions>
                    
                </CardHeader>
                <CardContent>
                    <Table>
                        <DataTableHead/>
                        <DataTableBody/>
                        <DataTablePaginationFooter/>
                    </Table>
                </CardContent>
            </Card>
        </DataTableProvider>
}
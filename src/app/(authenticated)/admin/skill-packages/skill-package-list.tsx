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
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTableFooter, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { SkillPackageData } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { trpc, WithCounts } from '@/trpc/client'


export function SkillPackagesList() {
    

    const skillPackagesQuery = useSuspenseQuery(trpc.skills.getPackages.queryOptions({ owner: 'org' }))

    async function handleRefresh() {
        await skillPackagesQuery.refetch()
    }

    const columns = useMemo(() => defineColumns<WithCounts<SkillPackageData, 'skills' | 'skillGroups'>>(columnHelper => [
        columnHelper.accessor('skillPackageId', {
            header: 'ID',
            cell: ctx => ctx.getValue(),
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('name', {
            header: 'Name',
            cell: ctx => <TextLink to={Paths.admin.skillPackage(ctx.row.original.skillPackageId)}>{ctx.getValue()}</TextLink>,
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
    ]), [])

    const table = useReactTable({
        columns,
        data: skillPackagesQuery.data,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: {
            columnVisibility: {
                skillPackageId: false, name: true, skillGroups: true, skills: true, status: true
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
                    <Protect role="org:admin">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link to={Paths.admin.skillPackages.create}>
                                        <PlusIcon />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Create new skill package
                            </TooltipContent>
                        </Tooltip>
                    </Protect>
                    

                    <RefreshButton onClick={handleRefresh}/>
                    <TableOptionsDropdown/>
                    <Separator orientation="vertical"/>
                    <CardExplanation>
                        This is a list of all the available skill packages in the system.
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
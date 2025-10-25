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

import Artie from '@/components/art/artie'
import { Show } from '@/components/show'
import { Button, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTableFooter, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillPackageData } from '@/lib/schemas/skill-package'
import * as Paths from '@/paths'
import { trpc, WithCounts } from '@/trpc/client'




export function AdminModule_SkillPackagesList({ organization }: { organization: OrganizationData }) {
    
    const { data: skillPackages, refetch: skillPackagesRefetch } = useSuspenseQuery(trpc.skills.getPackages.queryOptions({ orgId: organization.orgId, owner: 'org' }))

    async function handleRefresh() {
        await skillPackagesRefetch()
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
            cell: ctx => <TextLink to={Paths.org(organization.slug).spm.skillPackage(ctx.row.original.skillPackageId)}>{ctx.getValue()}</TextLink>,
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
        data: skillPackages,
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

    return <Show 
        when={skillPackages.length > 0} 
        fallback={<Empty>
            <EmptyHeader>
                <EmptyMedia>
                    <Artie pose="Empty"/>
                </EmptyMedia>
                <EmptyTitle>No Skill Packages Defined</EmptyTitle>
                <EmptyDescription>
                    Your organization has not created any skill packages yet.
                    <br/>
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Protect role="org:admin">
                    <Button asChild>
                        <Link to={Paths.org(organization.slug).spm.skillPackages.create}>
                            <PlusIcon className="mr-2 h-4 w-4"/>
                            Add Skill Package
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
                                        <Link to={Paths.org(organization.slug).spm.skillPackages.create}>
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
    </Show>
}
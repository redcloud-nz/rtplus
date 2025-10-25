/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel,  getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Table } from '@/components/ui/table'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'





export function AdminModule_SkillPackage_GroupsList({ organization, skillPackageId }: { organization: OrganizationData, skillPackageId: string }) {

    const groupsQuery = useSuspenseQuery(trpc.skills.getGroups.queryOptions({ orgId: organization.orgId, skillPackageId }))

    async function handleRefresh() {
        await groupsQuery.refetch()
    }

    const columns = useMemo(() => defineColumns<SkillGroupData>(columnHelper => [
        columnHelper.accessor('skillGroupId', {
            header: 'ID',
            cell: ctx => ctx.getValue(),
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
            enableGrouping: false,
        }),
        columnHelper.accessor('name', {
            header: 'Group',
            cell: ctx => <TextLink to={Paths.org(organization.slug).admin.skillPackage(skillPackageId).group(ctx.row.original.skillGroupId)}>{ctx.getValue()}</TextLink>,
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
        columnHelper.accessor('sequence', {
            header: 'Sequence',
            cell: ctx => ctx.getValue(),
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
            enableGrouping: false,
        }),
    ]), [skillPackageId])

    const table = useReactTable({
        columns,
        data: groupsQuery.data,
        onSortingChange: () => {},
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: {
            columnVisibility: {
                skillGroupId: false, name: true, description: true, status: true
            },
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ],
            globalFilter: '',
            sorting: [{ id: 'sequence', desc: false }],
        }
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <CardTitle>Skill Groups</CardTitle>
                <CardActions>
                    <Protect role="org:admin">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link to={Paths.org(organization.slug).admin.skillPackage(skillPackageId).groups.create}>
                                        <PlusIcon/>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Add new group
                            </TooltipContent>
                        </Tooltip>
                    </Protect>

                    <RefreshButton onClick={handleRefresh}/>
                    <TableOptionsDropdown/> 
                    <Separator orientation="vertical"/>
                    <CardExplanation>
                        Groups are used to organize skills within a skill package. You can create, edit, and delete groups as needed.
                    </CardExplanation>

                </CardActions>
                
            </CardHeader>
            <CardContent>
                <DataTableSearch />
                <Table>
                    <DataTableHead />
                    <DataTableBody />
                </Table>
            </CardContent>
            
        </Card>
    </DataTableProvider>
}
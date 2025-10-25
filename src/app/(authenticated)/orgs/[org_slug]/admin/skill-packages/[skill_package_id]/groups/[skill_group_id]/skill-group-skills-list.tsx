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
import { getCoreRowModel, getFilteredRowModel,  getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillData } from '@/lib/schemas/skill'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


export function AdminModule_SkillGroup_SkillsList({ organization, skillGroupId, skillPackageId }: { organization: OrganizationData, skillGroupId: string, skillPackageId: string }) {
    

    const skillsQuery = useSuspenseQuery(trpc.skills.getSkills.queryOptions({ orgId: organization.orgId, skillGroupId }))

    async function handleRefresh() {
        await skillsQuery.refetch()
    }

    const columns = useMemo(() => defineColumns<SkillData>(columnHelper => [
        columnHelper.accessor('skillId', {
            header: 'ID',
            cell: ctx => ctx.getValue(),
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
            enableGrouping: false,
        }),
        columnHelper.accessor('name', {
            header: 'Skill',
            cell: ctx => <TextLink to={Paths.org(organization.slug).admin.skillPackage(skillPackageId).skill(ctx.row.original.skillId)}>{ctx.getValue()}</TextLink>,
            enableGrouping: false,
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
        data: skillsQuery.data,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableGrouping: false,
        initialState: {
            columnVisibility: {
                id: false, name: true, description: true, frequency: false, status: true
            },
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ],
            globalFilter: '',
            grouping: [],
            sorting: [
                { id: 'sequence', desc: false }
            ],
        }
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardActions>
                    <Protect role="org:admin">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" disabled>
                                    <PlusIcon/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Add new skill to group.
                            </TooltipContent>
                        </Tooltip>
                    </Protect>

                    <RefreshButton onClick={handleRefresh}/>
                    <TableOptionsDropdown/>
                    <Separator orientation="vertical"/>
                    <CardExplanation>
                        Skills are the individual abilities or tasks that can be performed within a skill package. You can create, edit, and delete skills as needed.
                    </CardExplanation>
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
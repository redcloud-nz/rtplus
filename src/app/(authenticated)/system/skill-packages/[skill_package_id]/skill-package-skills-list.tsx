/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel,  getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button, RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Table } from '@/components/ui/table'

import { SkillData } from '@/lib/schemas/skill'
import { SkillGroupData } from '@/lib/schemas/skill-group'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'




export function System_SkillPackage_SkillsList_Card({ skillPackageId }: { skillPackageId: string }) {
    const trpc = useTRPC()

    const skillGroupsQuery = useSuspenseQuery(trpc.skills.getGroups.queryOptions({ skillPackageId }))
    const skillsQuery = useSuspenseQuery(trpc.skills.getSkills.queryOptions({ skillPackageId }))

    async function handleRefresh() {
        await Promise.all([skillsQuery.refetch(), skillGroupsQuery.refetch()])
    }

    const rowData = useMemo(() => skillsQuery.data.map(skill => ({
        ...skill,
        skillGroup: skillGroupsQuery.data.find(group => group.skillGroupId === skill.skillGroupId)!
    })), [skillsQuery.data, skillGroupsQuery.data])

    const columns = useMemo(() => defineColumns<SkillData & { skillGroup: SkillGroupData }>(columnHelper => [
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
            cell: ctx => <TextLink to={Paths.system.skillPackage(skillPackageId).skill(ctx.row.original.skillId)}>{ctx.getValue()}</TextLink>,
            enableGrouping: false,
            enableHiding: false
        }),
         columnHelper.accessor('skillGroup.name', {
            header: 'Group',
            cell: ctx => <TextLink to={Paths.system.skillPackage(skillPackageId).group(ctx.row.original.skillGroupId)}>{ctx.getValue()}</TextLink>,
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

    const table = useReactTable<SkillData & { skillGroup: SkillGroupData }>({
        columns,
        data: rowData,
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
                                <Link to={Paths.system.skillPackage(skillPackageId).skills.create}>
                                    <PlusIcon/>
                                </Link>
                                
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Add new skill
                        </TooltipContent>
                    </Tooltip>

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
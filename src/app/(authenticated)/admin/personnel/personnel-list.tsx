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
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Button, RefreshButton } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardExplanation, CardActions } from '@/components/ui/card'
import { DataTableBody, DataTableHead, DataTableFooter, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown} from '@/components/ui/data-table'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { PersonData } from '@/lib/schemas/person'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'


export function AdminModule_PersonnelList() {

    
    const personnelQuery = useSuspenseQuery(trpc.personnel.getPersonnel.queryOptions({}))

    async function handleRefresh() {
        await personnelQuery.refetch()
    }

    const columns = useMemo(() => defineColumns<PersonData>(columnHelper => [
        columnHelper.accessor('personId', {
            header: 'ID',
            cell: ctx => ctx.getValue(),
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('name', {
            header: 'Name',
            cell : ctx => <TextLink to={Paths.adminModule.person(ctx.row.original.personId)}>{ctx.getValue()}</TextLink>,
            enableHiding: false
        }),
        columnHelper.accessor('email', {
            header: 'Email',
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
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
        data: personnelQuery.data,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: {
            columnVisibility: {
                personId: false, name: true, email: true, status: true
            },
            columnFilters: [
                { id: 'status', value: ['Active' ]}
            ],
            globalFilter: "",
            grouping: [],
            sorting: [
                { id: 'name', desc: false }
            ],
            pagination: {
                pageIndex: 0,
                pageSize: 50
            },
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
                                    <Link to={Paths.adminModule.personnel.create}>
                                        <PlusIcon />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Create new person
                            </TooltipContent>
                        </Tooltip>
                    </Protect>
                    
                    <RefreshButton onClick={handleRefresh}/>
                    <TableOptionsDropdown/>
                    <Separator orientation="vertical"/>
                    
                    <CardExplanation>
                        Personnel are the people who can be assigned to teams and competencies. 
                        They can be active or inactive, and you can filter the list by status.
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
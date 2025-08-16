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
import { Card, CardActions, CardContent, CardExplanation, CardHeader} from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table} from '@/components/ui/table'

import { PersonData } from '@/lib/schemas/person'
import { TeamMembershipData } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'


/**
 * Card that displays the list of all team members and allows the user to add a new member.
 */
export function Team_MembersList_Card() {
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.activeTeam.getTeam.queryOptions())
    const membersQuery = useSuspenseQuery(trpc.activeTeam.members.getTeamMembers.queryOptions({}))

    async function handleRefresh() {
        await membersQuery.refetch()
    }

    const columns = useMemo(() => defineColumns<TeamMembershipData & { person: PersonData }>(columnHelper => [
        columnHelper.accessor('personId', {
            header: "Person ID",
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('person.name', {
            id: "name",
            header: "Name",
            cell: ctx => <TextLink href={Paths.team(team.slug).member(ctx.row.original.personId).href}>{ctx.getValue()}</TextLink>,
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,
        }),
        columnHelper.accessor('person.email', {
            id: "email",
            header: "Email",
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('tags', {
            header: "Tags",
            cell: ctx => ctx.getValue().join(', '),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: false,
        }),
        columnHelper.accessor('status', {
            header: "Status",
            cell: ctx => ctx.getValue(),
            enableGrouping: true,
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
            filterFn: 'arrIncludesSome',
            meta: {
                enumOptions: { Active: 'Active', Inactive: 'Inactive' },
                slotProps: {
                    th: {
                        className: 'w-32',
                    }
                }
            }

        }),
    ]), [team])

    const table = useReactTable<TeamMembershipData & { person: PersonData }>({
        columns,
        data: membersQuery.data,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            columnVisibility: {
                personId: false, name: true, email: true, tags: false, status: true,
            },
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ],
            globalFilter: "",
            grouping: [],
            sorting: [{ id: 'name', desc: false }],
        },
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
                                    <Link href={Paths.team(team.slug).members.create.href}>
                                        <PlusIcon/>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Add Team Member
                            </TooltipContent>
                        </Tooltip>
                        
                    </Protect>
                    <RefreshButton onClick={handleRefresh}/>
                      
                    <TableOptionsDropdown/>
                    <Separator orientation='vertical'/>
                    <CardExplanation>
                        This card is a list of your team members. 
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <Table className='table-fixed'>
                    <DataTableHead/>
                    <DataTableBody/>
                    <DataTableFooter/>
                </Table>
            </CardContent>
        </Card>
    </DataTableProvider>
    
}
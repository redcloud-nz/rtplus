/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information. 
 */
'use client'

import { format } from 'date-fns'

import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Card, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'

import { OrganizationData } from '@/lib/schemas/organization'
import { OrgMembershipData } from '@/lib/schemas/org-membership'
import { UserData } from '@/lib/schemas/user'
import { useTRPC } from '@/trpc/client'


/**
 * Card that displays the users associated with a team.
 * It fetches organization memberships for the team and displays them in a table.
 * It allows filtering and sorting of the data.
 * @param teamId The ID of the team to fetch users for.
 */
export function TeamUsersCard({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const { data: orgMemberships } = useSuspenseQuery(trpc.users.byTeam.queryOptions({ teamId }))

    const columns = useMemo(() => defineColumns<OrgMembershipData & { user: UserData, organization: OrganizationData }>(columnHelper => [
        columnHelper.accessor('user.name', {
            id: "name",
            header: "Name",
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,

        }),
        columnHelper.accessor('user.identifier', {
            id: "identifier",
            header: "Identifier",
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('role', {
            header: "Role",
            cell: ctx => ctx.getValue(),
            enableGrouping: true,
            enableHiding: true,
            enableSorting: false,
            filterFn: 'arrIncludesSome',
            meta: {
                enumOptions: { 'org:admin': 'Admin', 'org:member': 'Member' }
            }
        }),
        columnHelper.accessor('createdAt', {
            header: "Created",
            cell: info => format(info.getValue(), "dd MMM yyyy"),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
    ]), [])

    const table = useReactTable<OrgMembershipData & { user: UserData, organization: OrganizationData }>({
        columns: columns,
        data: orgMemberships,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: {
            columnVisibility: {
                name: true, identifier: true, role: true, createdAt: true
            },
            columnFilters: [
                { id: 'role', value: ['org:admin', 'org:member'] }
            ],
            grouping: [],
            sorting: [{ id: 'name', desc: false }],
        }
    })

    return <DataTableProvider value={table}>
         <Card>
            <CardHeader>
                <CardTitle>Team Users</CardTitle>
                {/* <AddTeamMemberDialog
                    teamId={teamId}
                    trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Add Team Member">
                        <PlusIcon/>
                    </DialogTriggerButton>}
                /> */}

                <TableOptionsDropdown/>
                <Separator orientation='vertical'/>

                <CardExplanation>
                    This card displays the users that have access to the team.
                </CardExplanation>
            </CardHeader>
            <CardContent>
                <Table className="table-fixed">
                    <DataTableHead/>
                    <DataTableBody/>
                    <DataTableFooter/>
                </Table>
            </CardContent>
            
        </Card>
    </DataTableProvider>
   
}
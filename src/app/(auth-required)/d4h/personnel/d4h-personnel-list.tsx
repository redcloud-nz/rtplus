/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { format as formatDate } from 'date-fns'
import { useMemo } from 'react'
import { mapToObj } from 'remeda'

import { useSuspenseQueries, useSuspenseQuery} from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown} from '@/components/ui/data-table'
import { EmailLink, PhoneLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'

import { D4hAccessTokens, extractUniqueTeams } from '@/lib/d4h-access-tokens'
import { D4hClient} from '@/lib/d4h-api/client'
import { D4hMember } from '@/lib/d4h-api/member'


const StatusOptions: Record<D4hMember['status'], string> = {
    OPERATIONAL: 'Operational',
    NON_OPERATIONAL: 'Non Operational',
    OBSERVER: 'Observer',
    RETIRED: 'Retired'
}


export function D4hPersonnelList_Card({ personId }: { personId: string }) {

    const { data: accessTokens } = useSuspenseQuery(D4hAccessTokens.queryOptions(personId))

    const d4hTeams = useMemo(() => extractUniqueTeams(accessTokens), [accessTokens])
    const teamNameMap = useMemo(() => mapToObj(d4hTeams, ({ team }) => [team.id, team.name]), [d4hTeams])

    const membersQuery = useSuspenseQueries({
        queries: d4hTeams.map(({ team, accessToken }) => 
            D4hClient.members.queryOptions(accessToken, { teamId: team.id })
        ),
        combine: (queryResults) => ({
            refetch: () => Promise.all(queryResults.map(qr => qr.refetch())),
            data: queryResults.flatMap(qr => (qr.data).results),
        })
    })
    
    async function handleRefresh() {
        await membersQuery.refetch()
    }

    const columns = useMemo(() => defineColumns<D4hMember>(columnHelper => [
        columnHelper.accessor('name', {
            header: 'Name',
            cell: info => info.getValue(),
            sortingFn: 'alphanumeric',
            enableGlobalFilter: true,
            enableHiding: false,
            enableGrouping: false,
            enableSorting: true,
        }),
        columnHelper.accessor('owner.id', {
            id: 'team',
            header: 'Team',
            cell: info => teamNameMap[info.getValue()] ?? 'Unknown',
            enableGlobalFilter: false,
            enableGrouping: true,
            enableSorting: true,
        }),
        columnHelper.accessor('ref', {
            header: 'Ref',
            cell: info => info.getValue(),
            sortingFn: 'alphanumeric',
            enableGlobalFilter: true,
            enableGrouping: false,
            enableSorting: true,
            meta: {
                align: 'center'
            }
        }),
        columnHelper.accessor('position', {
            id: 'position',
            header: 'Position',
            cell: info => info.getValue(),
            enableGlobalFilter: true,
            enableGrouping: true,
            enableSorting: true,
        }),
        columnHelper.accessor('status', {
            id: 'status',
            header: 'Status',
            cell: info => StatusOptions[info.getValue() as D4hMember['status']],
            filterFn: (row, columnId, filterValue) => (filterValue as string[] ?? []).includes(row.getValue(columnId)),
            enableGlobalFilter: false,
            enableColumnFilter: true,
            enableGrouping: true,
            enableSorting: false,
            meta: {
                align: 'center',
                enumOptions: StatusOptions
            },
        }),
        columnHelper.accessor('email.value', {
            id: 'email',
            header: 'Email',
            cell: info => <EmailLink email={info.getValue()}/>,
            enableGlobalFilter: true,
            enableSorting: false,
            enableGrouping: false,
        }),
        columnHelper.accessor('mobile.phone', {
            id: 'phone',
            header: 'Phone',
            cell: info => <PhoneLink phoneNumber={info.getValue()}/>,
            enableGlobalFilter: false,
            enableGrouping: false,
            enableSorting: false,
        }),
        columnHelper.accessor('startsAt', {
            id: 'joined',
            header: 'Joined',
            cell: info => formatDate(Date.parse(info.getValue()), 'MMM yyyy'),
            enableGlobalFilter: false,
            enableGrouping: false,
            enableSorting: true,
        })
    ]), [teamNameMap])

    const table = useReactTable({ 
        columns, 
        data: membersQuery.data,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(), 
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            columnVisibility: {
                name: true, team: true, ref: true,
                position: true, operational: true,
                email: false, phone: false, joined: false,
            },
            columnFilters: [
                { id: 'status', value: ['OPERATIONAL', 'NON_OPERATIONAL'] }
            ],
            expanded: true,
            globalFilter: "",
            grouping: [],
            sorting: [
                { id: 'name', desc: false }
            ],
            pagination: {
                pageIndex: 0,
                pageSize: 100
            }
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <DataTableSearch size="sm" variant="ghost"/>
                <CardActions>
                    <RefreshButton onClick={handleRefresh}/>
                    <TableOptionsDropdown/>
                    <Separator orientation="vertical"/>
                    <CardExplanation>
                        This list shows all personnel across all teams for all your configured D4H access keys. Use the filters to narrow down the results.
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <Show 
                    when={accessTokens.length > 0}
                    fallback={<Alert severity="info" title="No D4H Access Tokens">
                        No D4H access tokens configured. Please add a token in the settings to view personnel.
                    </Alert>}
                >
                    <Table>
                        <DataTableHead/>
                        <DataTableBody/>
                        <DataTableFooter variant="pagination"/>
                    </Table>
                </Show>
                
            </CardContent>
        </Card>
    </DataTableProvider>

}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import React, { useMemo } from 'react'
import { mapToObj } from 'remeda'

import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { RefreshButton } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown} from '@/components/ui/data-table'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'

import { D4hAccessTokens, extractUniqueTeams } from '@/lib/d4h-access-tokens'
import { D4hClient } from '@/lib/d4h-api/client'
import { D4hEvent } from '@/lib/d4h-api/event'
import { formatDateTime } from '@/lib/utils'


export function D4h_ActivitiesList_Card({ personId }: { personId: string }) {
    const { data: accessTokens } = useSuspenseQuery(D4hAccessTokens.queryOptions(personId))

    const d4hTeams = useMemo(() => extractUniqueTeams(accessTokens), [accessTokens])
    const teamNameMap = useMemo(() => mapToObj(d4hTeams, ({ team }) => [team.id, team.name]), [d4hTeams])

    const now = React.useMemo(() => new Date(), [])

    const activitiesQuery = useSuspenseQueries({
        queries: accessTokens.flatMap(accessKey => 
            accessKey.teams.flatMap(team => [
                D4hClient.events.queryOptions(accessKey, { teamId: team.id, type: 'events', scope: 'future', refDate: now }),
                D4hClient.events.queryOptions(accessKey, { teamId: team.id, type: 'exercises', scope: 'future', refDate: now }),
                D4hClient.events.queryOptions(accessKey, { teamId: team.id, type: 'incidents', scope: 'future', refDate: now })
            ])
        ),
        combine: (queryResults) => ({
            refetch: () => Promise.all(queryResults.map(qr => qr.refetch())),
            data: queryResults.flatMap(qr => qr.data.results),
        })
    })

    async function handleRefresh() {
        await activitiesQuery.refetch()
    }

    const columns = React.useMemo(() => {
        return defineColumns<D4hEvent>(columnHelper => [
            columnHelper.accessor('id', {
                header: 'ID',
                cell: info => info.getValue(),
                enableHiding: true,
                enableSorting: false,
                enableGlobalFilter: false,
            }),
            columnHelper.accessor('referenceDescription', {
                id: 'title',
                header: 'Title',
                cell: info => info.getValue(),
                enableGlobalFilter: true,
                enableGrouping: false,
                enableHiding: false,
                enableSorting: true,
            }),
            columnHelper.accessor('description', {
                header: 'Description',
                cell: info => info.getValue(),
                enableGlobalFilter: false,
                enableGrouping: false,
                enableHiding: false,
                enableSorting: true,
            }),
            columnHelper.accessor('owner.id', {
                id: 'team',
                header: 'Team',
                cell: info => teamNameMap[info.getValue()],
                enableGlobalFilter: false,
                enableGrouping: true,
                enableSorting: true,
            }),
            columnHelper.accessor('type', {
                header: 'Type',
                cell: info => info.getValue(),
                enableGlobalFilter: false,
                enableGrouping: false,
                enableHiding: true,
                enableSorting: true,
            }),
            columnHelper.accessor('startsAt', {
                header: 'Starts At',
                cell: info => formatDateTime(info.getValue()),
                enableGlobalFilter: false,
                enableGrouping: false,
                enableSorting: true,
            }),
            columnHelper.accessor('endsAt', {
                header: 'Ends At',
                cell: info => formatDateTime(info.getValue()),
                enableGlobalFilter: false,
                enableGrouping: false,
                enableSorting: true,
            }),
        ])
    }, [teamNameMap])

    const table = useReactTable({ 
        columns, 
        data: activitiesQuery.data,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(), 
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            columnFilters: [],
            columnVisibility: {
                id: false, title: true, description: false, team: true, type: true, startsAt: true, endsAt: true
            },
            expanded: true,
            globalFilter: "",
            grouping: [],
            pagination: {
                pageIndex: 0,
                pageSize: 100
            },
            sorting: [
                { id: 'startsAt', desc: false }
            ],
            
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
                        This list shows upcoming activities across all teams. Click on an activity to view more details.
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
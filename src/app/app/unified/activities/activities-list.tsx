/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import React from 'react'

import { useQueries } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { DataTable, DataTableColumnsDropdown, DataTableControls, DataTableGroupingDropdown, DataTableProvider, DataTableResetButton, DataTableSearch, defineColumns} from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'

import { getListResponseCombiner } from '@/lib/d4h-api/client'
import { D4hEvent, getFetchEventsQueryOptions } from '@/lib/d4h-api/event'
import { createTeamNameResolver } from '@/lib/team-name-resolver'
import { formatDateTime } from '@/lib/utils'
import { trpc } from '@/trpc/client'




export function ActivitiesList() {
    const accessKeysQuery = trpc.currentUser.d4hAccessKeys.useQuery(undefined, { initialData: [] })

    const now = React.useMemo(() => new Date(), [])

    const eventsQuery = useQueries({
        queries: accessKeysQuery.data.flatMap(accessKey => [
            getFetchEventsQueryOptions(accessKey, 'event', { refDate: now, scope: 'future'}),
            getFetchEventsQueryOptions(accessKey, 'exercise', { refDate: now, scope: 'future'}),
        ]),
        combine: getListResponseCombiner<D4hEvent>(),
    })

    const columns = React.useMemo(() => {
        const resolveTeamName = createTeamNameResolver(accessKeysQuery.data.map(key => key.team))
        return defineColumns<D4hEvent>(columnHelper => [
            columnHelper.accessor('referenceDescription', {
                id: 'title',
                header: 'Title',
                cell: info => info.getValue(),
                enableGlobalFilter: true,
                enableHiding: false,
                enableGrouping: false,
                enableSorting: true,
            }),
            columnHelper.accessor('owner.id', {
                id: 'team',
                header: 'Team',
                cell: info => resolveTeamName(info.getValue()),
                enableGlobalFilter: false,
                enableGrouping: true,
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
            })
        ])
    }, [accessKeysQuery.data])

    const table = useReactTable({ 
        columns, 
        data: eventsQuery.data ?? [],
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(), 
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        initialState: {
            columnVisibility: {
                title: true, team: true, startsAt: true, endsAt: true
            },
            columnFilters: [],
            expanded: true,
            globalFilter: "",
            grouping: [],
            sorting: [
                { id: 'startsAt', desc: false }
            ],
        },
    })

    if(eventsQuery.isPending) return <div>
        <div className="mb-2 flex items-center space-x-4">
            <Skeleton className="h-10 grow rounded-md"/>
            <Skeleton className="h-10 w-[120px] rounded-md"/>
            <Skeleton className="h-10 w-[120px] rounded-md"/>
        </div>
        <Skeleton className="w-full h-20 rounded-md"/>
    </div>

    else return <div>
        <DataTableProvider value={table}>
            <DataTableControls>
                <DataTableSearch/>
                <DataTableColumnsDropdown/>
                <DataTableGroupingDropdown/>
                <DataTableResetButton/>
            </DataTableControls>
            <div className="rounded-md border">
                <DataTable/>
            </div>
        </DataTableProvider>
        
    </div>
}
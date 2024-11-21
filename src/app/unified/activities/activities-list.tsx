'use client'

import React from 'react'

import { useQueries } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { DataTable, DataTableColumnsDropdown, DataTableControls, DataTableGroupingDropdown, DataTableProvider, DataTableResetButton, DataTableSearch, defineColumns} from '@/components/data-table'
import { Skeleton } from '@/components/ui/skeleton'

import { getListResponseCombiner } from '@/lib/d4h-api/client'
import { D4hAccessKeys } from '@/lib/d4h-access-keys'
import { D4hEvent, getFetchEventsQueryOptions } from '@/lib/d4h-api/event'
import { formatDateTime } from '@/lib/utils'


export interface ActivitiesListProps {
    accessKeys: D4hAccessKeys
}

export function ActivitiesList({ accessKeys }: ActivitiesListProps) {

    const now = React.useMemo(() => new Date(), [])

    const eventsQuery = useQueries({
        queries: accessKeys.keys.flatMap(accessKey => [
            getFetchEventsQueryOptions(accessKey, 'event', { refDate: now, scope: 'future'}),
            getFetchEventsQueryOptions(accessKey, 'exercise', { refDate: now, scope: 'future'}),
        ]),
        combine: getListResponseCombiner<D4hEvent>(),
    })

    const columns = React.useMemo(() => {
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
                cell: info => accessKeys.resolveTeamName(info.getValue()),
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
    }, [accessKeys])

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
            <Skeleton className="h-10 flex-grow rounded-md"/>
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
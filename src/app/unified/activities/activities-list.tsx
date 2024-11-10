'use client'

import React from 'react'

import { D4hAccessKey } from '@prisma/client'
import { useQueries } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { DataTable, DataTableControls, defineColumns} from '@/components/data-table'
import { Skeleton } from '@/components/ui/skeleton'

import { D4hFetchClient, D4HListResponse as D4hListResponse } from '@/lib/d4h-api/client'
import { D4hEvent } from '@/lib/d4h-api/event'
import { formatDateTime } from '@/lib/utils'


function getTeamName(accessKeys: D4hAccessKey[], teamId: number | null) {
    for(const accessKey of accessKeys) {
        if(accessKey.teamId == teamId) return accessKey.teamName.replace("NZ Response Team", "NZRT")
    }
    return ""
}

export interface ActivitiesListProps {
    accessKeys: D4hAccessKey[]
}

export function ActivitiesList({ accessKeys }: ActivitiesListProps) {

    const now = React.useMemo(() => new Date().toISOString(), [])

    const eventsQuery = useQueries({
        queries: accessKeys.map(accessKey => ({ 
            queryFn: async () => {
                const { data, error } = await D4hFetchClient.GET('/v3/{context}/{contextId}/exercises', {
                    params: {
                        path: { context: 'team', contextId: accessKey.teamId },
                        query: { after: now }
                    },
                    headers: { Authorization: `Bearer ${accessKey.key}` },
                })
                if(error) throw error
                return data as D4hListResponse<D4hEvent>
            },
            queryKey: [`/v3/team/${accessKey.teamId}/exercises`]
        })),
        combine: (queryResults) => {

            const isError = queryResults.some(qr => qr.isError)
            const isPending = queryResults.some(qr => qr.isPending)
            const isSuccess = queryResults.every(qr => qr.isSuccess)
            
            if(isSuccess) {
                const events: D4hEvent[] = []
                for(const result of queryResults) {
                    events.push(...(result.data).results)
                }
                return {
                    data: events,
                    isError, isPending, isSuccess
                }
               
            } else {
                return {
                    data: [],
                    isError, isPending, isSuccess
                }
            }
        },
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
                cell: info => getTeamName(accessKeys, info.getValue()),
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
        
        <DataTableControls table={table}/>
        <div className="rounded-md border">
            <DataTable table={table}/>
        </div>
    </div>
}
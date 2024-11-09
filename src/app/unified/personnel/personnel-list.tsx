'use client'

import { format as formatDate } from 'date-fns'
import React from 'react'

import { useQueries } from '@tanstack/react-query'
import { ColumnDef, createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'


import { D4hApi } from '@/lib/d4h-api/client'
import { D4hMember } from '@/lib/d4h-api/member'
import { EmailLink, PhoneLink } from '@/components/ui/link'
import { DataTable, DataTableControls } from '@/components/data-table'
import { Skeleton } from '@/components/ui/skeleton'

function getTeamName(accessKeys: PersonnelListProps['accessKeys'], teamId: number | null) {
    for(const accessKey of accessKeys) {
        if(accessKey.teamId == teamId) return accessKey.teamName.replace("NZ Response Team", "NZRT")
    }
    return ""
}

const StatusOptions: Record<D4hMember['status'], string> = {
    OPERATIONAL: 'Operational',
    NON_OPERATIONAL: 'Non Operational',
    OBSERVER: 'Observer',
    RETIRED: 'Retired'
}

export interface PersonnelListProps {
    accessKeys: { key: string, teamId: number, teamName: string }[]
}

export function PersonnelList({ accessKeys }: PersonnelListProps) {

    const membersQuery = useQueries({
        queries: accessKeys.map(accessKey => 
            D4hApi.queryOptions('get', '/v3/{context}/{contextId}/members', 
                {
                    params: { 
                        path: { context: 'team', contextId: accessKey.teamId },
                        query: { status: ['OPERATIONAL', 'NON_OPERATIONAL', 'OBSERVER'] }
                    },
                    headers: { Authorization: `Bearer ${accessKey.key}` },
                }
            )
        ),
        combine: (queryResults) => {

            const isError = queryResults.some(qr => qr.isError)
            const isPending = queryResults.some(qr => qr.isPending)
            const isSuccess = queryResults.every(qr => qr.isSuccess)
            
            if(isSuccess) {
                const members: D4hMember[] = []
                for(const result of queryResults) {
                    members.push(...(result.data as { results: D4hMember[] }).results)
                }
                return {
                    data: members.sort((a, b) => {
                        const teamNameA = getTeamName(accessKeys, a.owner.id)
                        const teamNameB = getTeamName(accessKeys, b.owner.id)
                        return teamNameA.localeCompare(teamNameB)
                    }),
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
        const columnHelper = createColumnHelper<D4hMember>()

        return [
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
                cell: info => getTeamName(accessKeys, info.getValue()),
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
        // eslint-disable-next-line
        ] satisfies ColumnDef<D4hMember, any>[]
    }, [accessKeys])

    const table = useReactTable({ 
        columns, 
        data: membersQuery.data ?? [],
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(), 
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        initialState: {
            columnVisibility: {
                name: true, team: true, ref: true,
                position: true, operational: true,
                email: false, phone: false
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
        },
    })

    if(membersQuery.isPending) return <div>
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
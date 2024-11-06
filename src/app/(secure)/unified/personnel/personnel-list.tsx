'use client'

import React from 'react'

import { useQueries } from '@tanstack/react-query'
import { ColumnDef, createColumnHelper, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, RowSelectionState, useReactTable } from '@tanstack/react-table'


import { D4hApi } from '@/lib/d4h-api/client'
import { D4hMember } from '@/lib/d4h-api/member'
import { EmailLink, PhoneLink } from '@/components/ui/link'
import { DataTable, DataTableControls } from '@/components/data-table'


export interface PersonnelListProps {
    accessKeys: { key: string, teamId: number, teamName: string }[]
}

export function PersonnelList({ accessKeys }: PersonnelListProps) {

    function getTeamName(teamId: number) {
        for(let accessKey of accessKeys) {
            if(accessKey.teamId == teamId) return accessKey.teamName.replace("NZ Response Team", "NZRT")
        }
        return ""
    }

    const membersQuery = useQueries({
        queries: accessKeys.map(accessKey => 
            D4hApi.queryOptions('get', '/v3/{context}/{contextId}/members', 
                {
                    params: { 
                        path: { context: 'team', contextId: accessKey?.teamId!! },
                        query: { status: ['OPERATIONAL', 'NON_OPERATIONAL'] }
                    },
                    headers: { Authorization: `Bearer ${accessKey?.key}` },
                }
            )
        ),
        combine: (queryResults) => {

            const isError = queryResults.some(qr => qr.isError)
            const isPending = queryResults.some(qr => qr.isPending)
            const isSuccess = queryResults.every(qr => qr.isSuccess)
            
            if(isSuccess) {
                const members: D4hMember[] = []
                for(let result of queryResults) {
                    members.push(...(result.data as { results: D4hMember[] }).results)
                }
                return {
                    data: members.sort((a, b) => getTeamName(a.owner.id!!).localeCompare(getTeamName(b.owner.id!!))),
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
                cell: info => getTeamName(info.getValue()),
                enableGlobalFilter: false,
                enableGrouping: true,
                enableSorting: true,
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
                header: 'Status',
                cell: info => info.getValue(),
                enableGlobalFilter: false,
                enableGrouping: true,
                enableSorting: false,
                meta: {
                    align: 'center'
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
                
            })
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
                name: true, team: true,
                position: true, operational: true,
                email: false, phone: false
            },
            expanded: true,
            globalFilter: "",
            grouping: [],
            sorting: [
                { id: 'name', desc: false }
            ],
        },
    })

    return <div>
        <DataTableControls table={table}/>
        <div className="rounded-md border">
            <DataTable table={table}/>
        </div>
    </div>
}
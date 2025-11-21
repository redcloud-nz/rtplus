/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { Protect } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { Lexington } from '@/components/blocks/lexington'
import { CreateNewIcon } from '@/components/icons'
import { Show } from '@/components/show'
import { S2_Button } from '@/components/ui/s2-button'
import { Link, TextLink } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { OrganizationData } from '@/lib/schemas/organization'
import { TeamData } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'




type RowData = TeamData & { _count: { teamMemberships: number } }

export function AdminModule_TeamsList({ organization }: { organization: OrganizationData }) {

    const { data: teams} = useSuspenseQuery(trpc.teams.getTeams.queryOptions({ orgId: organization.orgId }))

    const columns = useMemo(() => Akagi.defineColumns<RowData>(columnHelper => [
    // columnHelper.accessor('teamId', {
    //     header: ctx => <Akagi.TableHeader header={ctx.header} className="w-20">ID</Akagi.TableHeader>,
    //     cell: ctx => <Akagi.TableCell cell={ctx.cell} className="w-20">
    //         <TextLink to={Paths.org(organization.slug).admin.team(ctx.row.original.teamId)}>{ctx.getValue()}</TextLink>
    //     </Akagi.TableCell>,
    //     enableSorting: false,
    //     enableGlobalFilter: false,
    // }),
    columnHelper.accessor('name', {
        header: ctx => <Akagi.TableHeader header={ctx.header} className="min-w-1/3">Name</Akagi.TableHeader>,
        cell: ctx => <Akagi.TableCell cell={ctx.cell} className="min-w-1/3">
            <TextLink to={Paths.org(organization.slug).admin.team(ctx.row.original.teamId)}>{ctx.getValue()}</TextLink>
        </Akagi.TableCell>,
        enableSorting: true,
        enableGlobalFilter: true,
    }),
    columnHelper.accessor('_count.teamMemberships', {
        id: 'teamMemberCount',
        header: ctx => <Akagi.TableHeader header={ctx.header} align="center">Members</Akagi.TableHeader>,
        cell: ctx => <Akagi.TableCell cell={ctx.cell} align="center">{ctx.getValue()}</Akagi.TableCell>,
        enableSorting: true,
        enableGlobalFilter: false,
    }),
    columnHelper.accessor('status', {
        id: 'status',
        header: ctx => <Akagi.TableHeader 
            header={ctx.header}
            filterOptions={['Active', 'Inactive']}
            className="w-[100px]"
        >Status</Akagi.TableHeader>,
        cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue()}</Akagi.TableCell>,
        enableColumnFilter: true,
        enableGlobalFilter: false,
        enableSorting: false,
        filterFn: 'arrIncludesSome',
    }),
]), [])

    const table = useReactTable<RowData>({
        columns,
        data: teams,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ],
            globalFilter: "",
            grouping: [],
            sorting: [
                { id: 'name', desc: false }
            ],
        }
    })

    return <Show
        when={teams.length > 0}
        fallback={<Lexington.Empty title="No Teams Yet" description="There are no teams defined for your organisation. Get started by adding one.">
            <Protect role="org:admin">
                <S2_Button asChild>
                    <Link to={Paths.org(organization.slug).admin.teams.create}>
                        <CreateNewIcon/> New Team
                       
                    </Link>
                </S2_Button>
            </Protect>
        </Lexington.Empty>}
    >
        <Lexington.ColumnControls>
            <Akagi.TableSearch table={table} />
            <Protect role="org:admin">
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).admin.teams.create}>
                        <CreateNewIcon/> <span className="hidden md:inline">New Team</span>
                    </Link>
                </S2_Button>
            </Protect>
        </Lexington.ColumnControls>

        <Akagi.Table table={table}/>
    </Show>
}
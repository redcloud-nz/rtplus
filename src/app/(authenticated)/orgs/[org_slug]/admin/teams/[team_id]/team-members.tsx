/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useMemo } from 'react'

import { useSuspenseQueries } from '@tanstack/react-query'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Akagi } from '@/components/blocks/akagi'
import { AlertInfoIcon, CreateNewIcon } from '@/components/icons'
import { Show } from '@/components/show'
import { S2_Button } from '@/components/ui/s2-button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/items'
import { Link, TextLink } from '@/components/ui/link'

import { OrganizationData } from '@/lib/schemas/organization'
import { TeamId } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function AdminModule_TeamMembers({ organization, teamId }: { organization: OrganizationData, teamId: TeamId}) {

    const [
        { data: team },
        { data: teamMemberships }
    ] = useSuspenseQueries({
       queries: [
            trpc.teams.getTeam.queryOptions({ orgId: organization.orgId, teamId }),
            trpc.teamMemberships.getTeamMemberships.queryOptions({ orgId: organization.orgId, teamId })
        ]
    })

    const columns = useMemo(() => Akagi.defineColumns<typeof teamMemberships[number]>(columnHelper => [
        // columnHelper.accessor('personId', {
        //     header: ctx => <Akagi.TableHeader header={ctx.header} className="w-20">Person ID</Akagi.TableHeader>,
        //     cell: ctx => <Akagi.TableCell cell={ctx.cell} className="w-20">{ctx.getValue()}</Akagi.TableCell>,
        //     enableSorting: false,
        // }),
        columnHelper.accessor('person.name', {
            id: 'personName',
            header: ctx => <Akagi.TableHeader header={ctx.header} className="min-w-1/3">Person Name</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="min-w-1/3">
                <TextLink to={Paths.org(organization.slug).admin.team(ctx.row.original.teamId).member(ctx.row.original.personId)}>{ctx.getValue()}</TextLink>
            </Akagi.TableCell>,
            enableSorting: true,
        }),
        columnHelper.accessor('status', {
            header: ctx => <Akagi.TableHeader 
                header={ctx.header}
                filterOptions={['Active', 'Inactive']}
                className="w-[100px]"
            >Status</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell}>{ctx.getValue()}</Akagi.TableCell>,
            enableColumnFilter: true,
            enableSorting: false,
            filterFn: 'arrIncludesSome'
        }),
    ]), [])

    const table = useReactTable({
        data: teamMemberships,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ]
        },
    })

    return <Show 
        when={teamMemberships.length > 0}
        fallback={<Item variant="outline">
            <ItemMedia>
                <AlertInfoIcon/>
            </ItemMedia>
           <ItemContent>
                <ItemTitle>No Team Memberships</ItemTitle>
                <ItemDescription>{team.name} has no members.</ItemDescription>
           </ItemContent>
        </Item>}
    >
        <Akagi.Table table={table}/>
    </Show>

}
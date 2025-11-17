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
import { Link } from '@/components/ui/link'

import { OrganizationData } from '@/lib/schemas/organization'
import { PersonId } from '@/lib/schemas/person'
import * as Paths from '@/paths'

import { trpc } from '@/trpc/client'


export function AdminModule_Person_TeamMembershipList({ organization, personId }: { organization: OrganizationData, personId: PersonId }) {

    const [
        { data: person},
        { data: teamMemberships }
    ] = useSuspenseQueries({
       queries: [
            trpc.personnel.getPerson.queryOptions({ orgId: organization.orgId, personId }),
            trpc.teamMemberships.getTeamMemberships.queryOptions({ orgId: organization.orgId, personId })
        ]
    })

    const columns = useMemo(() => Akagi.defineColumns<typeof teamMemberships[number]>(columnHelper => [
        columnHelper.accessor('teamId', {
            header: ctx => <Akagi.TableHeader header={ctx.header} className="w-20">Team ID</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="w-20">{ctx.getValue()}</Akagi.TableCell>,
            enableSorting: false,
        }),
        columnHelper.accessor('team.name', {
            id: 'teamName',
            header: ctx => <Akagi.TableHeader header={ctx.header} className="min-w-1/3">Team Name</Akagi.TableHeader>,
            cell: ctx => <Akagi.TableCell cell={ctx.cell} className="min-w-1/3">{ctx.getValue()}</Akagi.TableCell>,
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
                <ItemDescription>{person.name} is not a member of any teams.</ItemDescription>
           </ItemContent>
           <ItemActions>
                <S2_Button variant="outline" asChild>
                    <Link to={Paths.org(organization.slug).admin.person(person.personId).teamMemberships.create}>
                        <CreateNewIcon/> Add Membership
                    </Link>
                </S2_Button>
           </ItemActions>
        </Item>}
    >
        <Akagi.Table table={table}/>
    </Show>

}
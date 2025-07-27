/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getGroupedRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTableBody, DataTableFooter, DataTableHead, DataTableProvider, DataTableSearch, defineColumns, TableOptionsDropdown } from '@/components/ui/data-table'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table} from '@/components/ui/table'

import { useToast } from '@/hooks/use-toast'
import { PersonData } from '@/lib/schemas/person'
import { TeamData } from '@/lib/schemas/team'
import { TeamMembershipData } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'

import { AddTeamMemberDialog } from './add-team-member'


/**
 * Card that displays the list of all team members and allows the user to add a new member.
 */
export function TeamMembersListCard({ team }: { team: TeamData }) {
    const trpc = useTRPC()

    const { data: memberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId: team.teamId }))

    const columns = useMemo(() => defineColumns<TeamMembershipData & { person: PersonData }>(columnHelper => [
        columnHelper.accessor('personId', {
            header: "Person ID",
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
            enableGlobalFilter: false,
        }),
        columnHelper.accessor('person.name', {
            id: "name",
            header: "Name",
            cell: ctx => <TextLink href={Paths.team(team.slug).member(ctx.row.original.personId).index}>{ctx.getValue()}</TextLink>,
            enableGrouping: false,
            enableHiding: false,
            enableSorting: true,
        }),
        columnHelper.accessor('person.email', {
            id: "email",
            header: "Email",
            cell: ctx => ctx.getValue(),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: true,
        }),
        columnHelper.accessor('tags', {
            header: "Tags",
            cell: ctx => ctx.getValue().join(', '),
            enableGrouping: false,
            enableHiding: true,
            enableSorting: false,
        }),
        columnHelper.accessor('status', {
            header: "Status",
            cell: ctx => ctx.getValue(),
            enableGrouping: true,
            enableHiding: true,
            enableSorting: false,
            enableGlobalFilter: false,
            filterFn: 'arrIncludesSome',
            meta: {
                enumOptions: { Active: 'Active', Inactive: 'Inactive' },
                slotProps: {
                    th: {
                        className: 'w-32',
                    }
                }
            }

        }),
    ]), [team])

    const table = useReactTable<TeamMembershipData & { person: PersonData }>({
        columns,
        data: memberships,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: {
            columnVisibility: {
                personId: false, name: true, email: true, tags: false, status: true,
            },
            columnFilters: [
                { id: 'status', value: ['Active'] }
            ],
            globalFilter: "",
            grouping: [],
            sorting: [{ id: 'name', desc: false }],
        },
    })

    return <DataTableProvider value={table}>
        <Card>
            <CardHeader>
                <DataTableSearch size="sm" variant="ghost"/>
                <CardActions>
                      <AddTeamMemberDialog
                        team={team}
                        trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Add member">
                            <PlusIcon />
                        </DialogTriggerButton>}
                    />
                    <TableOptionsDropdown/>
                    <Separator orientation='vertical'/>
                    <CardExplanation>
                        This card is a list of your team members. 
                    </CardExplanation>
                </CardActions>
            </CardHeader>
            <CardContent>
                <Table className='table-fixed'>
                    <DataTableHead/>
                    <DataTableBody/>
                    <DataTableFooter/>
                </Table>
            </CardContent>
        </Card>
    </DataTableProvider>
    
}
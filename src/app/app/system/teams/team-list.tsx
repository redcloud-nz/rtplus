/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { FiltersPopover, StatusFilter, useFilters } from '@/components/filters'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Card, CardBody, CardCollapseToggleButton, CardHeader, CardTitle } from '@/components/ui/card'

import { DialogTriggerButton } from '@/components/ui/dialog'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { TeamBasic, useTRPC } from '@/trpc/client'

import { CreateTeamDialog_sys } from './create-team'





type Filters = { status: ('Active' | 'Inactive')[] }


export function TeamsListCard_sys() {
    const filters = useFilters<Filters>({
        defaultValues: { status: ['Active', 'Inactive'] },
    })
    
    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <CreateTeamDialog_sys
                trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Add team">
                    <PlusIcon />
                </DialogTriggerButton>}
            />
            <FiltersPopover>
                <StatusFilter control={filters.control.status} />
            </FiltersPopover>
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <TeamsListTable_sys state={filters.state}/>
        </CardBody>
    </Card>
}

export function TeamsListTable_sys({ state }: { state: Filters }) {
    const trpc = useTRPC()

    const { data: teams } = useSuspenseQuery(trpc.teams.all.queryOptions())
    const filteredTeams = teams.filter((team: TeamBasic) => state.status.includes(team.status))

    return <Show
        when={filteredTeams.length > 0}
        fallback={teams.length === 0 
            ? <Alert severity="info" title="No teams defined.">Add a team to get started.</Alert>
            : <Alert severity="info" title="No teams match the selected filters.">Adjust your filters to see more teams.</Alert>}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Short Name</TableHeadCell>
                   
                    <TableHeadCell className='text-center'>Members</TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredTeams.map((team) => 
                    <TableRow key={team.id}>
                        <TableCell>
                            <Link href={Paths.system.teams.team(team.id).index} className="hover:underline">{team.name}</Link>
                        </TableCell>
                        <TableCell>{team.shortName}</TableCell>
                     
                        <TableCell className='text-center'>{team.memberCount}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Show>
}
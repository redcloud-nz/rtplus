/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Link, TextLink } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { StatusOptions, useListOptions } from '@/hooks/use-list-options'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'


export function TeamsListCard() {

    const { options, handleOptionChange } = useListOptions({})
    
    return <Card>
        <CardHeader>
            <CardTitle>List</CardTitle>
            <Button variant="ghost" size="icon" asChild>
                <Link href={Paths.system.teams.create} title="Create New Team">
                    <PlusIcon />
                </Link>
            </Button>

            <CardMenu title="Teams">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                        checked={options.showActive} 
                        onCheckedChange={handleOptionChange('showActive')}
                    >Active</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                        checked={options.showInactive} 
                        onCheckedChange={handleOptionChange('showInactive')}
                    >Inactive</DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
            </CardMenu>
            
        </CardHeader>
        <CardBody boundary>
            <TeamsListTable options={options}/>
        </CardBody>
    </Card>
}

export function TeamsListTable({ options }: { options: StatusOptions }) {
    const trpc = useTRPC()

    const { data: teams } = useSuspenseQuery(trpc.teams.all.queryOptions())
    const filteredTeams = teams.filter(team => 
        team.status == 'Active' ? options.showActive = true : options.showInactive = true
    )

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
                    { options.showInactive ? <TableHeadCell className='text-center'>Status</TableHeadCell> : null}
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredTeams.map((team) => 
                    <TableRow key={team.id}>
                        <TableCell>
                            <TextLink href={Paths.system.team(team.id).index}>{team.name}</TextLink>
                        </TableCell>
                        <TableCell>{team.shortName}</TableCell>
                     
                        <TableCell className='text-center'>{team.memberCount}</TableCell>
                        { options.showInactive ? <TableCell className='text-center'>{team.status}</TableCell> : null}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </Show>
}
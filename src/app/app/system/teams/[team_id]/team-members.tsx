/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { EllipsisVertical, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import { useListOptions } from '@/hooks/use-list-options'
import * as Paths from '@/paths'
import { TeamBasic,  useTRPC } from '@/trpc/client'



export function TeamMembersCard({ team }: { team: TeamBasic }) {

    const { options, handleOptionChange } = useListOptions({})

    return <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <Button variant="ghost" size="icon" asChild>
                    <Link href={Paths.system.team(team.id).members.create} title="Add Team Member">
                        <PlusIcon />
                    </Link>
                </Button>
                
                <CardMenu title="Team Members">
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
            <CardBody boundary collapsible>
                <TeamMembersTable teamId={team.id}/>
            </CardBody>
        </Card>
}

function TeamMembersTable({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const { data: teamMemberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))

    return <Show
        when={teamMemberships.length > 0}
        fallback={<Alert severity="info" title="No team members defined"/>}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Tags</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell className="w-10"></TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {teamMemberships
                    .sort((a, b) => a.person.name.localeCompare(b.person.name))
                    .map(({ person, ...membership }) =>
                        <TableRow key={person.id}>
                            <TableCell>
                                <Link href={Paths.system.person(person.id).index} className="hover:underline">{person.name}</Link>
                            </TableCell>
                            <TableCell>{membership.tags}</TableCell>
                            <TableCell>{membership.status}</TableCell>
                            <TableCell className="w-10 p-0 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <span className="sr-only">Actions</span>
                                            <EllipsisVertical />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    
                                    <DropdownMenuContent align="end" className="w-32">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem asChild>
                                                <Link href={Paths.system.team(teamId).member(person.id).update} title='Edit Team Membership'>
                                                    <PencilIcon/> Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={Paths.system.team(teamId).member(person.id).delete} title='Remove Team Membership'>
                                                    <TrashIcon/> Delete
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>
    </Show>
}
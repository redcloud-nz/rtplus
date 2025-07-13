/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { EllipsisVertical, InfoIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'

import {  useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link, TextLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



/**
 * Card that displays the list of all team memberships for a person and allows the user to add a new team membership.
 * @param personId The ID of the person for whom to display team memberships.
 */
export function TeamMembershipsCard({ personId }: { personId: string }) {
    return <Card>
        <CardHeader>
            <CardTitle>Team Memberships</CardTitle>
            <Button variant='ghost' size="icon" asChild>
                <Link href={Paths.system.person(personId).teamMemberships.create} title="Add Team Membership">
                    <PlusIcon/>
                </Link>
            </Button>
        </CardHeader>
        <CardContent boundary>
            <TeamMembershipsTable personId={personId}/>
        </CardContent>
    </Card>
}


/**
 * Component that displays the list of all team memberships for a person.
 * @param person The person for whom to display team memberships.
 */
function TeamMembershipsTable({ personId }: { personId: string }) {
    const trpc = useTRPC()

    const { data: teamMemberships } = useSuspenseQuery(trpc.teamMemberships.byPerson.queryOptions({ personId })) 

    return <Show 
        when={teamMemberships.length > 0}
        fallback={<Alert severity="info" title="No team memberships defined"/>}
    >
        <Table className="table-fixed">
            <TableHead>
                <TableRow>
                    <TableHeadCell>Team</TableHeadCell>
                    <TableHeadCell>Tags</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell className="w-10"></TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {teamMemberships
                    .sort((a, b) => a.team.name.localeCompare(b.team.name))
                    .map(({ team, ...membership }) => 
                        <TableRow key={membership.teamId}>
                            <TableCell>
                                <TextLink href={Paths.system.team(team.id).index}>
                                    {team.name}
                                </TextLink>
                            </TableCell>
                            <TableCell>{membership.tags}</TableCell>
                            <TableCell>{membership.status}</TableCell>
                            <TableCell className="w-10 p-0 text-right overflow-visible">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <EllipsisVertical />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel className="text-center">Team Membership</DropdownMenuLabel>
                                        <Separator/>
                                        <DropdownMenuItem disabled><InfoIcon/>Details</DropdownMenuItem>
                                        <Separator/>
                                        
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem asChild>
                                                <Link href={Paths.system.team(membership.teamId).member(membership.personId).update} title='Edit Team Membership'>
                                                    <PencilIcon/> Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={Paths.system.team(membership.teamId).member(membership.personId).delete} title='Remove Team Membership'>
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
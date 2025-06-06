/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { EllipsisVertical, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { match } from 'ts-pattern'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { EditTeamMembershipDialog } from '@/components/dialogs/edit-team-membership'
import { DeleteTeamMembershipDialog } from '@/components/dialogs/delete-team-membership'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardCollapseToggleButton, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'

import * as Paths from '@/paths'
import { PersonBasic, TeamMembershipBasic, useTRPC } from '@/trpc/client'

import { AddTeamMemberDialog } from './add-team-member'



export function TeamMembersCard({ teamId }: { teamId: string }) {

    return <Card>
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <AddTeamMemberDialog
                teamId={teamId}
                trigger={<DialogTriggerButton variant="ghost" size="icon" tooltip="Add Team Member">
                    <PlusIcon/>
                </DialogTriggerButton>}
            />
            <CardCollapseToggleButton/>
        </CardHeader>
        <CardBody boundary>
            <TeamMembersCardTable teamId={teamId}/>
        </CardBody>
        
    </Card>
}

function TeamMembersCardTable({ teamId }: { teamId: string }) {
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))
    const { data: teamMemberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))

    const [actionTarget, setActionTarget] = useState<{ action: 'Edit' | 'Delete', person: PersonBasic, membership: TeamMembershipBasic } | null>(null)

    return <Show
        when={teamMemberships.length > 0}
        fallback={<Alert severity="info" title="No team members defined"/>}
    >
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Role</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell className="w-10"></TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {teamMemberships
                    .sort((a, b) => a.person.name.localeCompare(b.person.name))
                    .map(({ person, ...membership }) =>
                        <TableRow key={membership.id}>
                            <TableCell>
                                <Link href={Paths.system.personnel.person(person.id).index} className="hover:underline">{person.name}</Link>
                            </TableCell>
                            <TableCell>{membership.role}</TableCell>
                            <TableCell>{membership.status}</TableCell>
                            <TableCell className="w-10 p-0 text-right overflow-visible">
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
                                                <DropdownMenuItem onClick={() => setActionTarget({ action: 'Edit', membership, person })}><PencilIcon/> Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setActionTarget({ action: 'Delete', membership, person })}><TrashIcon/> Delete</DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                }
            </TableBody>
        </Table>
        
        {match(actionTarget)
            .with(null, () => null)
            .with({ action: 'Edit' }, ({ person, membership }) => 
                <EditTeamMembershipDialog 
                    key={membership.id}
                    team={team}
                    membership={membership}
                    person={person}
                    open onOpenChange={(open) => { if(!open) setActionTarget(null)}}
                />
            )
            .with({ action: 'Delete' }, ({ person, membership }) => 
                <DeleteTeamMembershipDialog
                    key={membership.id}
                    team={team}
                    person={person}
                    open onOpenChange={(open) => { if(!open) setActionTarget(null)}}
                />
            )
            .exhaustive()
        }
    </Show>
}
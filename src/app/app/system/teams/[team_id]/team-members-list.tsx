/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { EllipsisVertical, PencilIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { match } from 'ts-pattern'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { CreateTeamMembershipByTeamForm } from '@/components/forms/create-team-membership'
import { UpdateTeamMembershipForm } from '@/components/forms/update-team-membership'
import { DeleteTeamMembershipForm } from '@/components/forms/delete-team-membership'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetTriggerButton } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { ObjectName } from '@/components/ui/typography'

import { useListOptions } from '@/hooks/use-list-options'
import * as Paths from '@/paths'
import { PersonBasic, TeamBasic, TeamMembershipBasic, useTRPC } from '@/trpc/client'




type ActionState = { action: 'Create' } | { action: 'Update' | 'Delete', membership: TeamMembershipBasic, person: PersonBasic } | null


export function TeamMembersCard_sys({ team }: { team: TeamBasic }) {

    const [actionTarget, setActionTarget] = useState<ActionState>(null)
    function handleOpenChange(open: boolean) { if (!open) setActionTarget(null) }

    const { options, handleOptionChange } = useListOptions({})

    return <Sheet open={actionTarget != null} onOpenChange={handleOpenChange}>
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                    <SheetTriggerButton onClick={() => setActionTarget({ action: 'Create' })} tooltip="Add Team Member">
                        <PlusIcon />
                    </SheetTriggerButton>
                
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
                <TeamMembersTable 
                    teamId={team.id}
                    onAction={setActionTarget}
                />
            </CardBody>
        </Card>

        <SheetContent>
            {match(actionTarget)
                .with({ action: 'Create' }, () => <>
                    <SheetHeader>
                        <SheetTitle>Add Team Member</SheetTitle>
                        <SheetDescription>
                            Add a new member to team <ObjectName>{team.name}</ObjectName>.
                        </SheetDescription>
                    </SheetHeader>
                    <SheetBody>
                        <CreateTeamMembershipByTeamForm 
                            teamId={team.id} 
                            onClose={() => setActionTarget(null)}
                        />
                    </SheetBody>
                </>)
                .with({ action: 'Update' }, ({ membership, person }) => <>
                    <SheetHeader>
                        <SheetTitle>Edit Team Membership</SheetTitle>
                        <SheetDescription>
                            Edit the team membership for <ObjectName>{person.name}</ObjectName> in <ObjectName>{team.name}</ObjectName>.
                        </SheetDescription>
                    </SheetHeader>
                    <SheetBody>
                        <UpdateTeamMembershipForm
                            membership={membership}
                            person={person}
                            team={team}
                            onClose={() => setActionTarget(null)}
                        />
                    </SheetBody>
                </>)
                .with({ action: 'Delete' }, ({ person }) => <>
                    <SheetHeader>
                        <SheetTitle>Remove Team Membership</SheetTitle>
                        <SheetDescription>
                            Remove the team membership for <ObjectName>{person.name}</ObjectName> in <ObjectName>{team.name}</ObjectName>.
                        </SheetDescription>
                    </SheetHeader>
                    <SheetBody>
                        <DeleteTeamMembershipForm
                            person={person}
                            team={team}
                            onClose={() => setActionTarget(null)}
                        />
                    </SheetBody>
                </>)
                .otherwise(() => null)
            }
        </SheetContent>
    </Sheet>
}

function TeamMembersTable({ onAction, teamId }: { onAction: (args: ActionState) => void, teamId: string }) {
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
                                <Link href={Paths.system.personnel.person(person.id).index} className="hover:underline">{person.name}</Link>
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
                                            <SheetTrigger asChild>
                                                <DropdownMenuItem onClick={() => onAction({ action: 'Update', membership, person })}>
                                                    <PencilIcon/> Edit
                                                </DropdownMenuItem>
                                            </SheetTrigger>
                                            <SheetTrigger asChild>
                                                <DropdownMenuItem onClick={() => onAction({ action: 'Delete', membership, person })}>
                                                    <PlusIcon/> Delete
                                                </DropdownMenuItem>
                                            </SheetTrigger>
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
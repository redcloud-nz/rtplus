/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { match } from 'ts-pattern'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogTriggerButton } from '@/components/ui/dialog'
import { Link } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { TeamMembershipWithTeam, useTRPC } from '@/trpc/client'

import { AddTeamMembershipDialog } from './add-team-membership'


/**
 * Card that displays the list of all team memberships for a person and allows the user to add a new team membership.
 * @param personId The ID of the person for whom to display team memberships.
 */
export function TeamMembershipsCard({ personId }: { personId: string }) {
    return <Card>
        <CardHeader>
            <CardTitle>Team memberships</CardTitle>
            <AddTeamMembershipDialog
                personId={personId}
                trigger={<DialogTriggerButton variant='ghost' size="icon" tooltip="Add team membership">
                    <PlusIcon/>
                </DialogTriggerButton>}
            />
        </CardHeader>
        <CardBody boundary>
            <TeamMembershipsTable personId={personId}/>
        </CardBody>
    </Card>
}


/**
 * Component that displays the list of all team memberships for a person.
 * @param personId The ID of the person for whom to display team memberships.
 */
function TeamMembershipsTable(props: { personId: string }) {
    const trpc = useTRPC()

    const { data: teamMemberships } = useSuspenseQuery(trpc.teamMemberships.byPerson.queryOptions({ personId: props.personId })) 

    type EditState = { membershipId: string, mode: 'Edit' | 'Delete' }
    const [editState, setEditState] = useState<EditState | null>(null)

    return <Show 
        when={teamMemberships.length > 0}
        fallback={<Alert severity="info" title="No team memberships defined"/>}
    >
        <Table className="table-fixed">
            <TableHead>
                <TableRow>
                    <TableHeadCell>Team</TableHeadCell>
                    <TableHeadCell>Role</TableHeadCell>
                    <TableHeadCell className="w-20"></TableHeadCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {teamMemberships
                    .sort((a, b) => a.team.name.localeCompare(b.team.name))
                    .map(membership => 
                        <TeamMembershipRow 
                            key={membership.id} 
                            membership={membership}
                            mode={editState?.membershipId == membership.id ? editState.mode : 'View'}
                            onCancel={() => setEditState(null)}
                            onEdit={() => setEditState({ membershipId: membership.id, mode: 'Edit' })}
                        />
                    )
                }
            </TableBody>
        </Table>
    </Show>
}

interface TeamMembershipRowProps {
    membership: TeamMembershipWithTeam
    mode: 'View' | 'Edit' | 'Delete'
    onCancel: () => void
    onEdit: () => void
}

/**
 * Component that displays a single team membership row in the table.
 * @param membership The team membership to display.
 * @param onEdit A callback function that is called when the edit button is clicked.
    */
    function TeamMembershipRow({ membership, mode, onCancel, onEdit }: TeamMembershipRowProps) {
    return <TableRow>
        <TableCell>
            <Link href={Paths.system.teams.team(membership.team.id).index} className="hover:underline">
                {membership.team.name}
            </Link>
        </TableCell>
        <TableCell>
            {mode == 'Edit'
                ? <Select value={membership.role}>
                    <SelectTrigger className="w-32 h-8 -m-1">
                        <SelectValue placeholder="Role"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Member">Member</SelectItem>
                    </SelectContent>
                </Select>
                : <div>{membership.role}</div>
            }
        </TableCell>
        <TableCell className="w-20 p-0 text-right">
            {match(mode)
                .with('View', () => <>
                    <div className="w-10"></div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={onEdit}>
                                <PencilIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Edit team membership
                        </TooltipContent>
                    </Tooltip>
                </>)
                .with('Edit', () => <>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <SaveIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Save changes
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={onCancel}>
                                <XIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Cancel
                        </TooltipContent>
                    </Tooltip>
                </>)
                .with('Delete', () => <>
                
                </>)
                .exhaustive()
            }
        </TableCell>
    </TableRow>
}
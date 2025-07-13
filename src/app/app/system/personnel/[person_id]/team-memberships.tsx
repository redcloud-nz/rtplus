/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { EllipsisVerticalIcon, FunnelIcon, PencilIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-react'
import { useState } from 'react'

import {  useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { TeamPicker } from '@/components/controls/team-picker'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CreateFormProps, UpdateFormProps } from '@/components/ui/form'
import { GridTable, GridTableBody, GridTableCell, GridTableDeleteRowButton, GridTableHead, GridTableHeadCell, GridTableHeadRow, GridTableRow, GridTableRowActions } from '@/components/ui/grid-table'
import { TagsInput } from '@/components/ui/input'
import { TextLink } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useListOptions } from '@/hooks/use-list-options'
import { useToast } from '@/hooks/use-toast'
import * as Paths from '@/paths'
import { TeamBasic, TeamMembershipBasic, useTRPC } from '@/trpc/client'
import { Dropdown } from 'react-day-picker'


/**
 * Card that displays the list of all team memberships for a person and allows the user to add a new team membership.
 * @param personId The ID of the person for whom to display team memberships.
 */
export function TeamMembershipsCard({ personId }: { personId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: teamMemberships } = useSuspenseQuery(trpc.teamMemberships.byPerson.queryOptions({ personId }))

    // Temporary fix for team data fetching
    // This should be replaced with TeamPicker that returns the team direct and not just the teamId.
    const { data: teams } = useSuspenseQuery(trpc.teams.all.queryOptions())

    const createMutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        async onMutate(newMembership) {
            await queryClient.cancelQueries(trpc.teamMemberships.byPerson.queryFilter({ personId }))

            const team = teams.find(t => t.id == newMembership.teamId)!

            const previousData = queryClient.getQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }))

            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }), (prev = []) => 
                [...prev, { ...newMembership, team }]
            )

            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }), context?.previousData)

            toast({
                title: 'Error Creating Team Membership',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess(result) {
            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: result.teamId }))
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: result.teamId }))
        },
    }))
    const updateMutation = useMutation(trpc.teamMemberships.update.mutationOptions({
        async onMutate(update) {
            await queryClient.cancelQueries(trpc.teamMemberships.byPerson.queryFilter({ personId }))

            const previousData = queryClient.getQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }))

            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }), (prev = []) => 
                prev.map(m => m.personId == update.personId ? { ...m, update } : m) 
            )
            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId: data.personId }), context?.previousData)

            toast({
                title: 'Error Updating Team Membership',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess(result) {
            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: result.personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: result.teamId }))
        },
    }))
    const deleteMutation = useMutation(trpc.teamMemberships.delete.mutationOptions({
        async onMutate({ teamId }) {
            await queryClient.cancelQueries(trpc.teamMemberships.byPerson.queryFilter({ personId }))

            const previousData = queryClient.getQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }))

            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }), (prev = []) => 
                prev.filter(m => m.teamId !== teamId)
            )

            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId: data.personId }), context?.previousData)

            toast({
                title: 'Error Deleting Team Membership',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess(result) {
            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: result.personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: result.teamId }))
        },
    }))

    const { options, handleOptionChange } = useListOptions({})

    const [action, setAction] = useState<{ type: 'update', id: string } | { type: 'create' } | null>(null)

    const existingTeamIds = teamMemberships.map(m => m.teamId)

    const filtered = teamMemberships.filter(person => 
        person.status == 'Active' ? options.showActive : options.showInactive
    )

    return <Card>
        <CardHeader>
            <CardTitle>Team Memberships</CardTitle>
            <CardActions>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setAction({ type: 'create' })}>
                            <PlusIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add a new team member</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical"/>

                <CardExplanation>
                    This card displays all team memberships for the person. You can add, edit, or delete team memberships.
                </CardExplanation>

            </CardActions>
        </CardHeader>
        <CardContent>
            <GridTable className="grid-cols-[1fr_100px_80px] lg:grid-cols-[1fr_1fr_140px_80px]">
                <GridTableHead>
                    <GridTableHeadRow>
                        <GridTableHeadCell id="columnHeader-name">Name</GridTableHeadCell>
                        <GridTableHeadCell id="columnHeader-tags" className="hidden lg:flex">Tags</GridTableHeadCell>
                        <GridTableHeadCell id="columnHeader-status">
                            <div>Status</div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <FunnelIcon/>
                                    </Button>
                                    </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>Show</DropdownMenuLabel>
                                        <DropdownMenuCheckboxItem
                                            checked={options.showActive} 
                                            onCheckedChange={handleOptionChange('showActive')}
                                        >Active</DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem 
                                            checked={options.showInactive} 
                                            onCheckedChange={handleOptionChange('showInactive')}
                                        >Inactive</DropdownMenuCheckboxItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </GridTableHeadCell>
                    </GridTableHeadRow>
                </GridTableHead>
                <GridTableBody>
                    { action?.type == 'create' ? <NewTeamMembershipForm
                        key="new-membership"
                        personId={personId}
                        onClose={() => setAction(null)}
                        onCreate={createMutation.mutate}
                        excludeTeamIds={existingTeamIds}
                    /> : null }
                    <Show when={teamMemberships.length == 0 && action?.type != 'create'}>
                        <Alert className="col-span-full w-full" severity="info" title="No team members defined"/>
                    </Show>
                    <Show when={teamMemberships.length > 0 && filtered.length == 0}>
                        <Alert className="col-span-full w-full" severity="info" title="No team members match the selected filters">
                            Adjust your filters to see more team memberships.
                        </Alert>
                    </Show>
                    {filtered
                        .sort((a, b) => a.team.name.localeCompare(b.team.name))
                        .map(({ team, ...membership }) => action?.type == 'update' && action.id == team.id
                            ?  <UpdateTeamMembershipForm 
                                    key={team.id} 
                                    membership={membership} 
                                    team={team}
                                    onClose={() => setAction(null)}
                                    onUpdate={updateMutation.mutate}
                                />
                            : <GridTableRow key={team.id}>
                                <GridTableCell>
                                    <TextLink href={Paths.system.team(team.id).index}>{team.name}</TextLink>
                                </GridTableCell>
                                <GridTableCell className="hidden lg:flex">{membership.tags.join(" ")}</GridTableCell>
                                <GridTableCell>{membership.status}</GridTableCell>
                                <GridTableRowActions>
                                    <Button variant="ghost" size="icon" onClick={() => setAction({ type: 'update', id: team.id })}>
                                        <PencilIcon />
                                    </Button>
                                    <GridTableDeleteRowButton onDelete={() => deleteMutation.mutate({ personId, teamId: team.id })}/>
                                </GridTableRowActions>
                            </GridTableRow>
                        )
                    }
                </GridTableBody>
            </GridTable>
        </CardContent>
    </Card>
}


function NewTeamMembershipForm({ excludeTeamIds, personId, onClose, onCreate}: CreateFormProps<TeamMembershipBasic> & { personId: string, excludeTeamIds: string[] }) {
   
    const [data, setData] = useState<TeamMembershipBasic>({
            personId,
            teamId: '',
            status: 'Active',
            tags: []
        })
    
        function handleSubmit() {
            onCreate?.(data)
            onClose()
        }


    return <GridTableRow asChild>
        <form onSubmit={handleSubmit}>
            <GridTableCell asChild>
                <TeamPicker
                    size="sm"
                    value={data.teamId}
                    onValueChange={(value) => setData(prev => ({ ...prev, teamId: value }))}
                    placeholder="Select a team"
                    exclude={excludeTeamIds}
                />
            </GridTableCell>
            <GridTableCell className="hidden lg:flex" asChild>
                <TagsInput
                    size="sm"
                    aria-labelledby="columnHeader-tags"
                    value={data.tags} 
                    onValueChange={(value) => setData(prev => ({ ...prev, tags: value }))}
                    placeholder="Add tags"
                />
            </GridTableCell>
            <GridTableCell asChild>
                <Select
                    aria-labelled-by="columnHeader-status"
                    value={data.status} 
                    onValueChange={(value) => setData(prev => ({ ...prev, status: value as 'Active' | 'Inactive' }))}
                >
                    <SelectTrigger size="sm">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </GridTableCell>
            <GridTableRowActions>
                <Button variant="ghost" size="icon" type="submit" disabled={!data.personId}>
                    <SaveIcon /> <span className="sr-only">Save</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <XIcon/> <span className="sr-only">Cancel</span>
                </Button>
            </GridTableRowActions>
        </form>
    </GridTableRow>
}

function UpdateTeamMembershipForm({ membership, team, onClose, onUpdate }: UpdateFormProps<TeamMembershipBasic> & { membership: TeamMembershipBasic, team: TeamBasic }) {
    const [modified, setModified] = useState(membership)

    const changed = modified.status !== membership.status || modified.tags !== membership.tags

    function handleSubmit() {
        if (changed) onUpdate?.(modified)
        onClose()
    }

    return <GridTableRow asChild>
        <form onSubmit={handleSubmit}>
            <GridTableCell>{team.name}</GridTableCell>
            <GridTableCell className="hidden lg:flex" asChild>
                <TagsInput
                    size="sm"
                    aria-labelledby="columnHeader-tags"
                    value={modified.tags} 
                    onValueChange={(value) => setModified(prev => ({ ...prev, tags: value }))}
                    placeholder="Add tags"
                />
            </GridTableCell>
            <GridTableCell asChild>
                <Select
                    aria-labelled-by="columnHeader-status"
                    value={modified.status} 
                    onValueChange={(value) => setModified(prev => ({ ...prev, status: value as 'Active' | 'Inactive' }))}
                >
                    <SelectTrigger size="sm">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </GridTableCell>
            <GridTableRowActions>
                <Button variant="ghost" size="icon" type="submit">
                    <SaveIcon /> <span className="sr-only">Save</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <XIcon/> <span className="sr-only">Cancel</span>
                </Button>
            </GridTableRowActions>
        </form>
    </GridTableRow>
}
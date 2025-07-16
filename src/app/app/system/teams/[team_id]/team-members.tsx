/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PlusIcon, SaveIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { PersonPicker } from '@/components/controls/person-picker'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { GridTable, GridTableBody, GridTableCell, GridTableHead, GridTableHeadCell, GridTableHeadRow, GridTableRow, GridTableRowActions } from '@/components/ui/grid-table'
import { TagsInput } from '@/components/ui/input'
import { TextLink } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { useListOptions } from '@/hooks/use-list-options'
import { useToast } from '@/hooks/use-toast'
import * as Paths from '@/paths'
import { TeamMembershipBasic, useTRPC } from '@/trpc/client'



export function TeamMembersCard({ teamId }: { teamId: string }) {
   
    const trpc = useTRPC()

    const { data: teamMemberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))

    const { options, handleOptionChange } = useListOptions({})

    const [action, setAction] = useState<{ type: 'update', id: string } | { type: 'create' } | null>(null)

    const existingMemberIds = teamMemberships.map(m => m.personId)

    return <Card>
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardActions>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setAction({ type: 'create' })}>
                            <PlusIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add a new team member</TooltipContent>
                </Tooltip>
                
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

                <Separator orientation='vertical'/>

                <CardExplanation>
                    This card displays the members of the team. You can add new members, edit existing ones, or delete them. 
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            <GridTable className="grid-cols-[1fr_100px_80px] lg:grid-cols-[1fr_1fr_140px_80px]">
                <GridTableHead>
                    <GridTableHeadRow>
                        <GridTableHeadCell id="columnHeader-name">Name</GridTableHeadCell>
                        <GridTableHeadCell id="columnHeader-tags" className="hidden lg:flex">Tags</GridTableHeadCell>
                        <GridTableHeadCell id="columnHeader-status">Status</GridTableHeadCell>
                    </GridTableHeadRow>
                </GridTableHead>
                <GridTableBody>
                    { action?.type == 'create' ? <NewTeamMembershipForm
                        key="new-membership"
                        teamId={teamId}
                        onClose={() => setAction(null)}
                        excludePersonIds={existingMemberIds}
                    /> : null }
                    <Show when={teamMemberships.length == 0 && action?.type != 'create'}>
                        <Alert className="col-span-full w-full" severity="info" title="No team members defined"/>
                    </Show>
                    {teamMemberships
                        .sort((a, b) => a.person.name.localeCompare(b.person.name))
                        .map(({ person, ...membership }) => 
                            <GridTableRow key={person.id}>
                                <GridTableCell>
                                    <TextLink href={Paths.system.team(teamId).member(person.id).index}>{person.name}</TextLink>
                                </GridTableCell>
                                <GridTableCell className="hidden lg:flex">{membership.tags.join(" ")}</GridTableCell>
                                <GridTableCell>{membership.status}</GridTableCell>
                                <GridTableRowActions/>
                            </GridTableRow>
                        )
                    }
                </GridTableBody>
            </GridTable>
        </CardContent>
    </Card>
}

function NewTeamMembershipForm({ excludePersonIds, teamId, onClose }: { teamId: string, excludePersonIds: string[], onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    // Temporary fix for personnel data fetching
    // This should be replaced with PersonPicker that returns the person directly and not just the personId.
    const { data: personnel } = useSuspenseQuery(trpc.personnel.all.queryOptions())

    const mutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        async onMutate(newMembership) {
            await queryClient.cancelQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))

            const person = personnel.find(p => p.id === newMembership.personId)!

            const previousData = queryClient.getQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }))

            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }), (prev = []) => 
                [...prev, { ...newMembership, person }]
            )

            onClose()
            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }), context?.previousData)

            toast({
                title: 'Error Creating Team Membership',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess(result) {
            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: result.personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: result.teamId }))
        },
    }))

    const [data, setData] = useState<TeamMembershipBasic>({
        personId: '',
        teamId,
        status: 'Active',
        tags: []
    })

    return <GridTableRow asChild>
        <form onSubmit={() => mutation.mutate(data)}>
            <GridTableCell asChild>
                <PersonPicker
                    size="sm"
                    value={data.personId}
                    onValueChange={(value) => setData(prev => ({ ...prev, personId: value }))}
                    placeholder="Select a person"
                    exclude={excludePersonIds}
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
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { PersonPicker } from '@/components/controls/person-picker'
import { Show } from '@/components/show'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardHeader, CardMenu, CardTitle } from '@/components/ui/card'
import { DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { CreateFormProps, UpdateFormProps } from '@/components/ui/form'
import { GridTable, GridTableBody, GridTableCell, GridTableDeleteRowButton, GridTableHead, GridTableHeadCell, GridTableHeadRow, GridTableRow, GridTableRowActions } from '@/components/ui/grid-table'
import { TagsInput } from '@/components/ui/input'
import { TextLink } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

import { useListOptions } from '@/hooks/use-list-options'
import { useToast } from '@/hooks/use-toast'
import * as Paths from '@/paths'
import { PersonBasic, TeamMembershipBasic, useTRPC } from '@/trpc/client'



export function TeamMembersCard({ teamId }: { teamId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: teamMemberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))

    // Temporary fix for personnel data fetching
    // This should be replaced with PersonPicker that returns the person directly and not just the personId.
    const { data: personnel } = useSuspenseQuery(trpc.personnel.all.queryOptions())

    const createMutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        async onMutate(newMembership) {
            await queryClient.cancelQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))

            const person = personnel.find(p => p.id === newMembership.personId)!

            const previousData = queryClient.getQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }))

            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }), (prev = []) => {
                return [...prev, { ...newMembership, person }]
            })

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
        onSettled() {
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))
        }
    }))
    const updateMutation = useMutation(trpc.teamMemberships.update.mutationOptions({
        async onMutate(update) {
            await queryClient.cancelQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))

            const previousData = queryClient.getQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId: update.teamId }))

            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId: update.teamId }), (prev = []) => {
                return prev.map((item) => item.personId == update.personId ? { ...item, update } : item)
            })
            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }), context?.previousData)

            toast({
                title: 'Error Updating Team Membership',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))
        }
    }))
    const deleteMutation = useMutation(trpc.teamMemberships.delete.mutationOptions({
        async onMutate({ personId }) {
            await queryClient.cancelQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))

            const previousData = queryClient.getQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }))

            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }), (prev = []) => {
                return prev.filter((membership) => membership.person.id !== personId)
            })

            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }), context?.previousData)

            toast({
                title: 'Error Deleting Team Member',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))
        }
    }))

    const { options, handleOptionChange } = useListOptions({})

    const [editTarget, setEditTarget] = useState<string | null>(null)
    const [newRow, setNewRow] = useState(false)

    function handleEdit(personId: string) {
        setEditTarget(personId)
        setNewRow(false)
    }

    function handleNew() {
        setEditTarget(null)
        setNewRow(true)
    }

    const memberIds = teamMemberships.map(m => m.person.id)

    return <Card>
        <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardActions>
                <Button variant="ghost" size="icon" onClick={handleNew}>
                    <PlusIcon/>
                </Button>
                <Separator orientation='vertical'/>
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
            </CardActions>
        </CardHeader>
        <CardContent>
                <GridTable className="grid-cols-[1fr_100px_80px] lg:grid-cols-[1fr_1fr_140px_80px]">
                    <GridTableHead>
                        <GridTableHeadRow>
                            <GridTableHeadCell id="columnHeader-name">Name</GridTableHeadCell>
                            <GridTableHeadCell id="columnHeader-tags" className="hidden lg:block">Tags</GridTableHeadCell>
                            <GridTableHeadCell id="columnHeader-status">Status</GridTableHeadCell>
                        </GridTableHeadRow>
                    </GridTableHead>
                    <Show
                        when={teamMemberships.length > 0 || newRow}
                        fallback={<Alert className="col-span-full w-full" severity="info" title="No team members defined"/>}
                    >
                        <GridTableBody>
                            { newRow ? <NewTeamMembershipForm
                                key="new-membership"
                                teamId={teamId}
                                onClose={() => setNewRow(false)}
                                onCreate={createMutation.mutate}
                                existingMembers={memberIds}
                            /> : null }
                            {teamMemberships
                                .sort((a, b) => a.person.name.localeCompare(b.person.name))
                                .map(({ person, ...membership }) => editTarget == person.id
                                    ?  <UpdateTeamMembershipForm 
                                            key={person.id} 
                                            membership={membership} 
                                            person={person}
                                            onClose={() => setEditTarget(null)}
                                            onUpdate={updateMutation.mutate}
                                        />
                                    : <GridTableRow key={person.id}>
                                        <GridTableCell>
                                            <TextLink href={Paths.system.person(person.id).index}>{person.name}</TextLink>
                                        </GridTableCell>
                                        <GridTableCell className="hidden lg:flex">{membership.tags.join(" ")}</GridTableCell>
                                        <GridTableCell>{membership.status}</GridTableCell>
                                        <GridTableRowActions>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(person.id)}>
                                                <PencilIcon />
                                            </Button>
                                            <GridTableDeleteRowButton onDelete={() => deleteMutation.mutate({ personId: person.id, teamId })}/>
                                        </GridTableRowActions>
                                    </GridTableRow>
                                )
                            }
                        </GridTableBody>
                    </Show>
                </GridTable>
        </CardContent>
    </Card>
}

function NewTeamMembershipForm({ existingMembers, teamId, onClose, onCreate }: CreateFormProps<TeamMembershipBasic> & { teamId: string, existingMembers: string[] }) {

    const [data, setData] = useState<TeamMembershipBasic>({
        personId: '',
        teamId,
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
                <PersonPicker
                    size="sm"
                    value={data.personId}
                    onValueChange={(value) => setData(prev => ({ ...prev, personId: value }))}
                    placeholder="Select a person"
                    exclude={existingMembers}
                />
            </GridTableCell>
            <GridTableCell className="hidden lg:flex" asChild>
                <TagsInput
                    size="sm"
                    aria-labelledby="columnHeader-tags"
                    value={data.tags} 
                    onValueChange={(value) => setData(prev => ({ ...prev, tags: value }))}
                    placeholder="Add tags (e.g. 'developer', 'designer')"
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

function UpdateTeamMembershipForm({ membership, person, onClose, onUpdate }: UpdateFormProps<TeamMembershipBasic> & { membership: TeamMembershipBasic, person: PersonBasic }) {
    
    const [modified, setModified] = useState(membership)

    const changed = modified.status !== membership.status || modified.tags !== membership.tags

    function handleSubmit() {
        if (changed) onUpdate?.(modified)
        onClose()
    }

    return <GridTableRow asChild>
        <form onSubmit={handleSubmit}>
            <GridTableCell>{person.name}</GridTableCell>
            <GridTableCell className="hidden lg:flex" asChild>
                <TagsInput
                    size="sm"
                    aria-labelledby="columnHeader-tags"
                    value={modified.tags} 
                    onValueChange={(value) => setModified(prev => ({ ...prev, tags: value }))}
                    placeholder="Add tags (e.g. 'developer', 'designer')"
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
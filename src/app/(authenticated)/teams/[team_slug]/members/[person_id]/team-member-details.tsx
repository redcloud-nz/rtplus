/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'

import { Protect } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { DeleteTeamMembershipDialog } from '@/components/dialogs/delete-team-membership'
import { Show } from '@/components/show'
import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input, TagsInput } from '@/components/ui/input'
import { TextLink } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useToast } from '@/hooks/use-toast'
import { PersonData, personSchema } from '@/lib/schemas/person'
import { TeamRef } from '@/lib/schemas/team'
import { TeamMembershipData, teamMembershipSchema } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'




export function Team_Member_Details_Card({ personId, teamId, showTags }: { personId: string, teamId: string, showTags: boolean }) {
    const router = useRouter()
    const trpc = useTRPC()

    const { data: { person, team, ...membership } } = useSuspenseQuery(trpc.teamMemberships.getTeamMembership.queryOptions({ personId, teamId }))

    const [mode, setMode] = useState<'View' | 'Update'>('View')

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardActions>
                <Protect role="org:admin">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setMode('Update')}>
                                <PencilIcon />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit membership details</TooltipContent>
                    </Tooltip>
                    <DeleteTeamMembershipDialog
                        onDelete={() => {
                            router.push(Paths.team(team.slug).members.href)
                        }}
                        personId={personId}
                        teamId={team.teamId}
                    />

                    <Separator orientation="vertical" />
                    <CardExplanation>
                        This card displays the details of the team membership for the selected person in the team. You can edit the membership details or delete the membership entirely.
                    </CardExplanation>
                </Protect>
            </CardActions>
        </CardHeader>
        <CardContent>
            {match(mode)
                .with('View', () => 
                    <ToruGrid>
                        <ToruGridRow
                            label="Team"
                            control={<DisplayValue><TextLink to={Paths.system.team(team.teamId)}>{team.name}</TextLink></DisplayValue>}
                        />
                        <ToruGridRow
                            label="Name"
                            control={<DisplayValue>{person.name}</DisplayValue>}
                        />
                        <ToruGridRow
                            label="Email"
                            control={<DisplayValue>{person.email}</DisplayValue>}
                        />
                        <Show when={showTags}>
                             <ToruGridRow
                                label="Tags"
                                control={<DisplayValue>{membership.tags.join(" ")}</DisplayValue>}
                            />
                        </Show>
                        <ToruGridRow
                            label="Status"
                            control={<DisplayValue>{membership.status}</DisplayValue>}
                        />
                        <ToruGridFooter/>
                    </ToruGrid>
                )
                .with('Update', () => 
                    <UpdateTeamMembershipForm 
                        membership={membership}
                        onClose={() => setMode('View')}
                        team={team}
                        showTags={showTags}
                    />
                )
                .exhaustive()
            }
        </CardContent>
    </Card>
}

function UpdateTeamMembershipForm({ membership, onClose, team, showTags }: { membership: TeamMembershipData, onClose: () => void, team: TeamRef, showTags: boolean }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: person } = useSuspenseQuery(trpc.personnel.getPerson.queryOptions({ personId: membership.personId }))

    const isOwner = person.owningTeamId === team.teamId
    const queryKey = trpc.teamMemberships.getTeamMembership.queryKey({ personId: person.personId, teamId: team.teamId })
    

    const form = useForm<TeamMembershipData & Pick<PersonData, 'name' | 'email'>>({
        resolver: zodResolver(teamMembershipSchema.merge(personSchema.pick({ name: true, email: true }))),
        defaultValues: {
            personId: person.personId,
            teamId: team.teamId,
            name: person.name,
            email: person.email,
            tags: membership.tags,
            status: membership.status
        }
    })

    const mutation = useMutation(trpc.teamMemberships.updateTeamMembership.mutationOptions({
        async onMutate({ personId, teamId, ...update }) {

            await queryClient.cancelQueries(trpc.teamMemberships.getTeamMembership.queryFilter({ personId, teamId }))
            
            // Snapshot the previous value
            const previousData = queryClient.getQueryData(queryKey)

            if(previousData) {
                queryClient.setQueryData(queryKey, { ...previousData, ...update })
            }

            onClose()
            return { previousData }
        },
        onError(error, data, context) {
            // Rollback to previous data
            queryClient.setQueryData(queryKey, context?.previousData)

            toast({
                title: 'Error updating team membership',
                description: error.message,
                variant: 'destructive'
            })
        },
        async onSuccess() {
            toast({
                title: 'Team membership updated',
                description: `${person.name}'s membership in '${team.name}' has been updated.`,
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ personId: membership.personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ teamId: membership.teamId }))
            queryClient.invalidateQueries(trpc.teamMemberships.getTeamMembership.queryFilter({ personId: membership.personId, teamId: membership.teamId }))
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
            <ToruGrid mode="form">
                 <FormField
                    control={form.control}
                    name="teamId"
                    render={() => <ToruGridRow
                        label="Team"
                        control={ <DisplayValue>{team.name}</DisplayValue>}
                    />}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => <ToruGridRow
                        label="Name"
                        control={isOwner ? <Input maxLength={100} {...field}/> : <DisplayValue>{field.value}</DisplayValue>}
                        description="The full name of the person."
                    />}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => <ToruGridRow
                        label="Email"
                        control={isOwner ? <Input type="email" maxLength={100} {...field}/> : <DisplayValue>{field.value}</DisplayValue>}
                        description="The email address of the person (must be unique)."
                    />}
                />
                <Show when={showTags}>
                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => <ToruGridRow
                            label="Tags"
                            control={<DisplayValue>{field.value.join(", ")}</DisplayValue>}
                            description="Tags can be used to categorize or label the membership for easier searching and filtering."
                        />}
                    />
                </Show>
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => <ToruGridRow
                        label="Tags"
                        control={<TagsInput value={field.value} onValueChange={field.onChange} placeholder="Add tags"/>}
                        description="Tags can be used to categorize or label the membership for easier searching and filtering."
                    />}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => <ToruGridRow
                        label="Status"
                        control={
                            <Select {...field} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        }
                        description="The current status of the membership."
                    />}
                />
                <ToruGridFooter>
                    <FormSubmitButton labels={SubmitVerbs.update} size="sm" requireDirty/>
                    <FormCancelButton onClick={onClose} size="sm"/>
                </ToruGridFooter>
            </ToruGrid>
            </Form>
    </FormProvider>
           
}
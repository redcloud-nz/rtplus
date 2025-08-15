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

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { DeleteTeamMembershipDialog } from '@/components/dialogs/delete-team-membership'
import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue } from '@/components/ui/display-value'
import { Form,  FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { TagsInput } from '@/components/ui/input'
import { TextLink } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'

import { useToast } from '@/hooks/use-toast'
import { PersonData } from '@/lib/schemas/person'
import { TeamData } from '@/lib/schemas/team'
import { TeamMembershipData, teamMembershipSchema } from '@/lib/schemas/team-membership'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'




export function System_TeamMembership_Details_Card({ context, personId, teamId }: { context: 'person' | 'team', personId: string, teamId: string }) {
    const router = useRouter()
    const trpc = useTRPC()

    const { data: { person, team, ...membership } } = useSuspenseQuery(trpc.teamMemberships.getTeamMembership.queryOptions({ personId, teamId }))

    const [mode, setMode] = useState<'View' | 'Update'>('View')

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardActions>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setMode('Update')} disabled={mode == 'Update'}>
                            <PencilIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit membership details</TooltipContent>
                </Tooltip>
                <DeleteTeamMembershipDialog
                    onDelete={() => {
                        if(context == 'person') router.push(Paths.system.person(person.personId).href)
                        else router.push(Paths.system.team(team.teamId).href)
                    }}
                    personId={personId}
                    teamId={teamId}
                />
                <Separator orientation="vertical"/>
                <CardExplanation>
                    This card displays the details of {person.name}&apos;s membership in {team.name}. You can edit the membership details or delete the membership entirely.
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            {match(mode)
                .with('View', () => 
                    <ToruGrid>
                        <ToruGridRow
                            label="Team"
                            control={<DisplayValue><TextLink href={Paths.system.team(team.teamId).href}>{team.name}</TextLink></DisplayValue>}
                        />
                        <ToruGridRow
                            label="Person"
                            control={<DisplayValue><TextLink href={Paths.system.person(person.personId).href}>{person.name}</TextLink></DisplayValue>}
                        />
                        <ToruGridRow
                            label="Tags"
                            control={<DisplayValue>{membership.tags.join(" ")}</DisplayValue>}
                        />
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
                        person={person}
                        team={team}
                    />
                )
                .exhaustive()
            }
        </CardContent>
    </Card>
}

function UpdateTeamMembershipForm({ membership, onClose, person, team }: { membership: TeamMembershipData, onClose: () => void, person: PersonData, team: TeamData }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<TeamMembershipData>({
        resolver: zodResolver(teamMembershipSchema),
        defaultValues: { ...membership }
    })

    const mutation = useMutation(trpc.teamMemberships.updateTeamMembership.mutationOptions({
        async onMutate({ personId, teamId, ...update }) {


            await queryClient.cancelQueries(trpc.teamMemberships.getTeamMembership.queryFilter({ personId, teamId }))
            

            // Snapshot the previous value
            const previousData = queryClient.getQueryData(trpc.teamMemberships.getTeamMembership.queryKey({ personId, teamId }))

            if(previousData) {
                queryClient.setQueryData(trpc.teamMemberships.getTeamMembership.queryKey({ personId, teamId }), { ...previousData, ...update })
            }

            onClose()
            return { previousData }
        },
        onError(error, data, context) {
            // Rollback to previous data
            queryClient.setQueryData(trpc.teamMemberships.getTeamMembership.queryKey({ personId: data.personId, teamId: data.teamId }), context?.previousData)

            toast({
                title: 'Error updating team membership',
                description: error.message,
                variant: 'destructive'
            })
        },
        async onSuccess(result) {
            toast({
                title: 'Team membership updated',
                description: `${person.name}'s membership in '${team.name}' has been updated.`,
            })

            await queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ personId: result.personId }))
            await queryClient.invalidateQueries(trpc.teamMemberships.getTeamMemberships.queryFilter({ teamId: result.teamId }))
        },
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
                    name="teamId"
                    render={({}) => <ToruGridRow
                        label="Person"
                        control={ <DisplayValue>{person.name}</DisplayValue>}
                    />}
                />
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => <ToruGridRow
                        label="Tags"
                        control={ <TagsInput value={field.value} onValueChange={field.onChange} placeholder="Add tags"/>}
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



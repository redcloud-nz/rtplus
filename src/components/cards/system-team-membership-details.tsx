/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { PencilIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { match } from 'ts-pattern'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardActions, CardContent, CardExplanation, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { TagsInput } from '@/components/ui/input'
import { TextLink } from '@/components/ui/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema } from '@/lib/forms/team-membership'
import * as Paths from '@/paths'
import { PersonBasic, TeamBasic, TeamMembershipBasic, useTRPC } from '@/trpc/client'



export function SystemTeamMembershipDetailsCard({ context, personId, teamId }: { context: 'person' | 'team', personId: string, teamId: string }) {
    const router = useRouter()
    const trpc = useTRPC()

    const { data: { person, team, ...membership } } = useSuspenseQuery(trpc.teamMemberships.byId.queryOptions({ personId, teamId }))

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
                        if(context == 'person') router.push(Paths.system.person(person.id).index)
                        else router.push(Paths.system.team(team.id).index)
                    }}
                    personId={personId}
                    teamId={teamId}
                />
                <Separator orientation="vertical"/>
                <CardExplanation>
                    This card displays the details of {person.name}'s membership in {team.name}. You can edit the membership details or delete the membership entirely.
                </CardExplanation>
            </CardActions>
        </CardHeader>
        <CardContent>
            {match(mode)
                .with('View', () => 
                    <ToruGrid>
                        <ToruGridRow
                            label="Team"
                            control={<DisplayValue><TextLink href={Paths.system.team(team.id).index}>{team.name}</TextLink></DisplayValue>}
                        />
                        <ToruGridRow
                            label="Person"
                            control={<DisplayValue><TextLink href={Paths.system.person(person.id).index}>{person.name}</TextLink></DisplayValue>}
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

function UpdateTeamMembershipForm({ membership, onClose, person, team }: { membership: TeamMembershipBasic, onClose: () => void, person: PersonBasic, team: TeamBasic }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<SystemTeamMembershipFormData>({
        resolver: zodResolver(systemTeamMembershipFormSchema),
        defaultValues: { ...membership }
    })

    const mutation = useMutation(trpc.teamMemberships.update.mutationOptions({
        async onMutate({ personId, teamId, ...update }) {


            await queryClient.cancelQueries(trpc.teamMemberships.byId.queryFilter({ personId, teamId }))
            

            // Snapshot the previous value
            const previousData = queryClient.getQueryData(trpc.teamMemberships.byId.queryKey({ personId, teamId }))

            if(previousData) {
                queryClient.setQueryData(trpc.teamMemberships.byId.queryKey({ personId, teamId }), { ...previousData, ...update })
            }

            onClose()
            return { previousData }
        },
        onError(error, data, context) {
            // Rollback to previous data
            queryClient.setQueryData(trpc.teamMemberships.byId.queryKey({ personId: data.personId, teamId: data.teamId }), context?.previousData)

            toast({
                title: 'Error updating team membership',
                description: error.message,
                variant: 'destructive'
            })
        },
        async onSuccess(result) {
            toast({
                title: 'Team membership updated',
                description: `${result.person.name}'s membership in '${result.team.name}' has been updated.`,
            })

            await queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: result.personId }))
            await queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: result.teamId }))
        },
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
            <ToruGrid mode="form">
                 <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => <ToruGridRow
                        label="Team"
                        control={ <DisplayValue>{team.name}</DisplayValue>}
                    />}
                />
                <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => <ToruGridRow
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


function DeleteTeamMembershipDialog({ onDelete, personId, teamId }: { onDelete: (membership: TeamMembershipBasic) => void , personId: string, teamId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: { person, team } } = useSuspenseQuery(trpc.teamMemberships.byId.queryOptions({ personId, teamId }))

    const [open, setOpen] = useState(false)

    const form = useForm<Pick<SystemTeamMembershipFormData, 'personId' | 'teamId'>>({
        resolver: zodResolver(systemTeamMembershipFormSchema.pick({ personId: true, teamId: true })),
        defaultValues: { personId, teamId }
    })

    const mutation = useMutation(trpc.teamMemberships.delete.mutationOptions({
        onError(error) {
            toast({
                title: 'Error deleting team membership',
                description: error.message,
                variant: 'destructive'
            })
            setOpen(false)
        },
        async onSuccess(result) {
            toast({
                title: 'Team Membership Deleted',
                description: <>The membership for <ObjectName>{person.name}</ObjectName> in <ObjectName>{team.name}</ObjectName> has been deleted.`</>,
            })

            setOpen(false)
            onDelete?.(result)

            await queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: result.personId }))
            await queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: result.teamId }))
        },
    }))

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTriggerButton tooltip="Delete Team Membership">
            <TrashIcon/>
        </DialogTriggerButton>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Team Membership</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete this team membership? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <FormProvider {...form}>
                    <Form onSubmit={form.handleSubmit(data => mutation.mutateAsync(data))}>
                        <FormItem>
                            <FormLabel>Person</FormLabel>
                            <FormControl>
                                <DisplayValue>{person.name}</DisplayValue>
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Team</FormLabel>
                            <FormControl>
                                <DisplayValue>{team.name}</DisplayValue>
                            </FormControl>
                        </FormItem>
                        <FormActions>
                            <FormSubmitButton 
                                labels={SubmitVerbs.delete} 
                                color="destructive"
                            />
                            <FormCancelButton onClick={() => setOpen(false)}/>
                        </FormActions>
                    </Form>
                </FormProvider>
            </DialogBody>
        </DialogContent>
    </Dialog>
}
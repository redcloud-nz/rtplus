/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { FixedFormValue, Form, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs, UpdateFormProps } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema } from '@/lib/forms/team-membership'
import { useToast } from '@/hooks/use-toast'
import { PersonBasic, TeamBasic, TeamMembershipBasic, useTRPC } from '@/trpc/client'



export function UpdateTeamMembershipForm({ membership, onClose, onUpdate, person, team }: UpdateFormProps<TeamMembershipBasic> & { membership: TeamMembershipBasic, person: PersonBasic, team: TeamBasic }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<SystemTeamMembershipFormData>({
        resolver: zodResolver(systemTeamMembershipFormSchema),
        defaultValues: { ...membership }
    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.teamMemberships.update.mutationOptions({
        async onMutate({ personId, teamId, ...update }) {
            await queryClient.cancelQueries(trpc.teamMemberships.byPerson.queryFilter({ personId }))
            await queryClient.cancelQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))

            // Snapshot the previous value
            const previousByPerson = queryClient.getQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }))
            const previousByTeam = queryClient.getQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }))

            if(previousByPerson) {
                queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }), previousByPerson.map(m => 
                    m.teamId == teamId ? { ...m, ...update } : m
                ))
            }
            if(previousByTeam) {
                queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }), previousByTeam.map(m => 
                    m.personId == personId ? { ...m, ...update } : m
                ))
            }

            return { previousByPerson, previousByTeam }
        },
        onError(error, data, context) {
            // Rollback to previous data
            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId: data.personId }), context?.previousByPerson)
            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId: data.teamId }), context?.previousByTeam)

            toast({
                title: 'Error updating team membership',
                description: error.message,
                variant: 'destructive'
            })
            handleClose()
        },
        onSuccess() {
            toast({
                title: 'Team membership updated',
                description: `${person.name}'s membership in '${team.name}' has been updated.`,
            })
            handleClose()
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: membership.personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: membership.teamId }))
        }
    })) 

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
            <FormItem>
                <FormLabel>Person</FormLabel>
                <FormControl>
                    <FixedFormValue value={person.name} />
                </FormControl>
            </FormItem>
            <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                    <FixedFormValue value={team.name} />
                </FormControl>
            </FormItem>
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-1/2">
                                <SelectValue placeholder="Status..."/>
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage/>
                </FormItem>}
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.update}/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </Form>
    </FormProvider>
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { PersonPicker } from '@/components/controls/person-picker'
import { PersonValue } from '@/components/controls/person-value'
import { TeamPicker } from '@/components/controls/team-picker'
import { TeamValue } from '@/components/controls/team-value'
import { FormControl, FormActions, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, FormCancelButton, CreateFormProps, SubmitVerbs, Form } from '@/components/ui/form'

import { useToast } from '@/hooks/use-toast'
import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema } from '@/lib/forms/team-membership'
import { TeamMembershipWithPerson, TeamMembershipWithTeam, useTRPC } from '@/trpc/client'




export function CreateTeamMembershipByTeamForm({ teamId, onClose, onCreate }: CreateFormProps<TeamMembershipWithPerson> & { teamId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: memberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))

    const form = useForm<SystemTeamMembershipFormData>({
        resolver: zodResolver(systemTeamMembershipFormSchema),
        defaultValues: {
            teamId,
            personId: '',
            tags: [],
            status: 'Active',
        }
    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        async onSuccess(newMembership) {
            
            toast({
                title: "Team membership added",
                description: `${newMembership.person.name} has been added to the ${newMembership.team.name}.`,
            })
            handleClose()
            onCreate?.(newMembership)

            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: newMembership.personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: newMembership.teamId }))
            
        }
    }))

    const currentMembers = memberships.map(m => m.person.id)
    
    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit((formData) => mutation.mutateAsync(formData))}>
            <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                    <TeamValue teamId={teamId}/>
                </FormControl>
            </FormItem>
            <FormField
                control={form.control}
                name="personId"
                render={({ field }) => <FormItem>
                    <FormLabel>Person</FormLabel>
                    <FormControl>
                        <PersonPicker {...field} onValueChange={field.onChange} exclude={currentMembers}/>
                    </FormControl>
                    <FormMessage/>
                </FormItem>}
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.add}/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </Form>
    </FormProvider>
}

export function CreateTeamMembershipByPersonForm({ personId, onClose, onCreate }: CreateFormProps<TeamMembershipWithTeam> & { personId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: person } = useSuspenseQuery(trpc.personnel.byId.queryOptions({ personId }))
    const { data: teams } = useSuspenseQuery(trpc.teams.all.queryOptions())
    const { data: memberships } = useSuspenseQuery(trpc.teamMemberships.byPerson.queryOptions({ personId }))

    const form = useForm<SystemTeamMembershipFormData>({
        resolver: zodResolver(systemTeamMembershipFormSchema),
        defaultValues: {
            personId,
            teamId: '',
            tags: [],
            status: 'Active',
        }
    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        async onSuccess(newMembership) {
            toast({
                title: "Team membership added",
                description: `${newMembership.person.name} has been added to the ${newMembership.team.name}.`,
            })
            handleClose()
            onCreate?.(newMembership)

            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: newMembership.personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: newMembership.teamId }))
        }
    }))

    const currentTeams = memberships.map(m => m.team.id)

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((formData) => mutation.mutateAsync(formData))} className="max-w-2xl space-y-4">
            <FormItem>
                <FormLabel>Person</FormLabel>
                <FormControl>
                    <PersonValue personId={personId}/>
                </FormControl>
            </FormItem>
            <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => <FormItem>
                    <FormLabel>Team</FormLabel>
                    <FormControl>
                        <TeamPicker {...field} onValueChange={field.onChange} exclude={currentTeams}/>
                    </FormControl>
                    <FormMessage/>
                </FormItem>}
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.add}/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </form>
    </FormProvider> 
}
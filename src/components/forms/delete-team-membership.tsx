/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { DeleteFormProps, FixedFormValue, FormActions, FormCancelButton, FormControl, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema } from '@/lib/forms/team-membership'
import { TeamMembershipBasic, useTRPC } from '@/trpc/client'

/**
 * Common form for a system admin to delete a team membership.
 */
export function DeleteTeamMembershipForm({ personId, teamId, onClose }: DeleteFormProps<TeamMembershipBasic> & { personId: string, teamId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: membership } = useSuspenseQuery(trpc.teamMemberships.byId.queryOptions({ personId, teamId }))

    const form = useForm<Pick<SystemTeamMembershipFormData, 'personId' | 'teamId'>>({
        resolver: zodResolver(systemTeamMembershipFormSchema.pick({ personId: true, teamId: true })),
        defaultValues: { personId, teamId }
    })

    const mutation = useMutation(trpc.teamMemberships.delete.mutationOptions({
        async onMutate({ personId, teamId }) {
            await queryClient.cancelQueries(trpc.teamMemberships.byPerson.queryFilter({ personId }))
            await queryClient.cancelQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))

            const previousByPerson = queryClient.getQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }))
            const previousByTeam = queryClient.getQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }))

            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }), (oldData) => oldData?.filter(m => m.teamId !== teamId))
            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }), (oldData) => oldData?.filter(m => m.personId !== personId))

            onClose()
            return { previousByPerson, previousByTeam }
        },
        onError(error, data, context) {
            // Rollback the optimistic update
            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId: data.personId }), context?.previousByPerson)
            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId: data.teamId }), context?.previousByTeam)

            toast({
                title: 'Error deleting team membership',
                description: error.message,
                variant: 'destructive',
            })
        },
        async onSuccess() {
            toast({
                title: 'Team membership deleted',
                description: <>Successfully removed <ObjectName>{membership.person.name}</ObjectName> from <ObjectName>{membership.team.name}</ObjectName>.</>
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId }))
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))
        }
        
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className='max-w-xl space-y-4'>
            <FormItem>
                <FormLabel>Person</FormLabel>
                <FormControl>
                    <FixedFormValue value={membership.person.name}/>
                </FormControl>
            </FormItem>
            <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                    <FixedFormValue value={membership.team.name}/>
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} variant="destructive"/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}
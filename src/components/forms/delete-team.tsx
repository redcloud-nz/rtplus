/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { FormControl, FormActions, FormItem, FormLabel, FormSubmitButton, FormCancelButton, SubmitVerbs, FixedFormValue, DeleteFormProps } from '@/components/ui/form'

import { useToast } from '@/hooks/use-toast'
import { TeamFormData, teamFormSchema } from '@/lib/forms/team'
import { TeamBasic, useTRPC } from '@/trpc/client'



export function DeleteTeamForm({ teamId, onClose, onDelete }: DeleteFormProps<TeamBasic> & { teamId: string }) {

    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))

    const form = useForm<Pick<TeamFormData, 'teamId'>>({
        resolver: zodResolver(teamFormSchema.pick({ teamId: true })),
        defaultValues: { teamId }
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.teams.sys_delete.mutationOptions({
        async onMutate() {
            await queryClient.cancelQueries(trpc.teams.all.queryFilter())
            await queryClient.cancelQueries(trpc.teams.byId.queryFilter({ teamId }))

            const previousAll = queryClient.getQueryData(trpc.teams.all.queryKey()) ?? []
            const previousById = queryClient.getQueryData(trpc.teams.byId.queryKey({ teamId }))
            
            queryClient.setQueryData(trpc.teams.all.queryKey(), previousAll.filter(t => t.id !== teamId))
            queryClient.setQueryData(trpc.teams.byId.queryKey({ teamId }), undefined)
            
            handleClose()
            return { previousAll, previousById }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.teams.all.queryKey(), context?.previousAll)
            queryClient.setQueryData(trpc.teams.byId.queryKey({ teamId }), context?.previousById)
            
            toast({
                title: 'Error deleting team',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSuccess(result) {
            toast({
                title: 'Team deleted',
                description: `The team "${result.name}" has been deleted successfully.`,
            })
            onDelete?.(result)
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teams.all.queryFilter())
            queryClient.invalidateQueries(trpc.teams.byId.queryFilter({ teamId }))
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="max-w-2xl space-y-4">
            <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                    <FixedFormValue value={team.name}/>
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} variant="destructive"/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </form>
    </FormProvider>
}
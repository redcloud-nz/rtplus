/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs, UpdateFormProps } from '@/components/ui/form'
import { Input, SlugInput } from '@/components/ui/input'

import { TeamFormData, teamFormSchema } from '@/lib/forms/team'
import { useToast } from '@/hooks/use-toast'
import { TeamBasic, useTRPC } from '@/trpc/client'



export function UpdateTeamForm({ teamId, onClose, onUpdate }: UpdateFormProps<TeamBasic> & { teamId: string }) {
    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))
    if(team == null) throw new Error(`Team(${teamId}) not found`)

    const form = useForm<TeamFormData>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: {
            ...team
        }
    })

    const { toast } = useToast()

    const mutation = useMutation(trpc.teams.sys_update.mutationOptions({
        async onMutate({ teamId, ...formData }) {
            await queryClient.cancelQueries(trpc.teams.byId.queryFilter({ teamId }))

            // Snapshot the previous value
            const previousTeam = queryClient.getQueryData(trpc.teams.byId.queryKey({ teamId }))

            // Optimistically update the team data
            if(previousTeam) {
                queryClient.setQueryData(trpc.teams.byId.queryKey({ teamId }),{ ...previousTeam, ...formData })
            }

            return { previousTeam }
        },

        onError: (error, data, context) => {
            // Rollback to the previous value
            queryClient.setQueryData(trpc.teams.byId.queryKey({ teamId }), context?.previousTeam)

            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof TeamFormData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error updating team",
                    description: error.message,
                    variant: 'destructive',
                })
                onClose()
            }
        },
        onSuccess(updatedTeam) {
            toast({
                title: "Team updated",
                description: `Team "${updatedTeam.name}" has been updated.`,
            })
            onClose()
            onUpdate?.(updatedTeam)
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teams.byId.queryFilter({ teamId }))
            queryClient.invalidateQueries(trpc.teams.all.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className="max-w-xl space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input maxLength={100} {...field}/>
                    </FormControl>
                    <FormDescription>The full name of the team.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="shortName"
                render={({ field }) => <FormItem>
                    <FormLabel>Short name</FormLabel>
                    <FormControl>
                        <Input maxLength={20} {...field}/>
                    </FormControl>
                    <FormDescription>Short name of the team (eg NZ-RT13).</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="slug"
                render={({ field }) => <FormItem>
                
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                        <SlugInput {...field} onChange={(ev, newValue) => field.onChange(newValue)}/>
                    </FormControl>
                    <FormDescription>URL-friendly identifier for the team.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            {/* <FormField
                control={form.control}
                name="color"
                render={({ field }) => <FormItem>
                    <FormLabel>Colour</FormLabel>
                    <FormControl>
                        <Input className="max-w-xs" maxLength={7} {...field}/>
                    </FormControl>
                    <FormDescription>Highlight colour applied to help differentiate from other teams (optional).</FormDescription>
                    <FormMessage/>
                </FormItem>}
            /> */}
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.update}/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}
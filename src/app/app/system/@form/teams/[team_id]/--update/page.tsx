/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/teams/[team_id]/--update
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Form, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs, UpdateFormProps } from '@/components/ui/form'
import { Input, SlugInput } from '@/components/ui/input'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { TeamFormData, teamFormSchema } from '@/lib/forms/team'
import { useToast } from '@/hooks/use-toast'
import { TeamBasic, useTRPC } from '@/trpc/client'
import { ObjectName } from '@/components/ui/typography'


export default function UpdateTeamSheet(props: { params: Promise<{ team_id: string}> }) {
    const { team_id: teamId } = use(props.params)

    const router = useRouter()

    return <Sheet open={true} onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Update Team</SheetTitle>
                <SheetDescription>Update the details of the team.</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <UpdateTeamForm
                    teamId={teamId}
                    onClose={() => router.back()} 
                />
            </SheetBody>
        </SheetContent>
    </Sheet>

}


export function UpdateTeamForm({ teamId, onClose, onUpdate }: UpdateFormProps<TeamBasic> & { teamId: string }) {
    const queryClient = useQueryClient()
     const { toast } = useToast()
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))

    const form = useForm<TeamFormData>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: {
            ...team
        }
    })

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
        onSuccess(result) {
            toast({
                title: "Team updated",
                description: <>The team <ObjectName>{result.name}</ObjectName> has been updated.</>,
            })
            onClose()
            onUpdate?.(result)
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teams.byId.queryFilter({ teamId }))
            queryClient.invalidateQueries(trpc.teams.all.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
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
        </Form>
    </FormProvider>
}
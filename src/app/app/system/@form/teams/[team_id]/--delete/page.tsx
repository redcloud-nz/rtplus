/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/teams/[team_id]/--delete
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { TeamValue } from '@/components/controls/team-value'
import { Form, FormControl, FormActions, FormItem, FormLabel, FormSubmitButton, FormCancelButton, SubmitVerbs, DeleteFormProps } from '@/components/ui/form'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { TeamFormData, teamFormSchema } from '@/lib/forms/team'
import * as Paths from '@/paths'
import { TeamBasic, useTRPC } from '@/trpc/client'


export default function DeleteTeamSheet(props: { params: Promise<{ team_id: string }> }) {
    const { team_id: teamId } = use(props.params)

    const router = useRouter()

    return <Sheet open onOpenChange={open => { if(!open) router.back() }}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Delete Team</SheetTitle>
                <SheetDescription>Permanently delete team?</SheetDescription>
            </SheetHeader>
            <SheetBody>
                <DeleteTeamForm
                    teamId={teamId}
                    onClose={() => router.back()}
                    onDelete={() => router.push(Paths.system.teams.index)}
                />
            </SheetBody>
        </SheetContent>
    </Sheet>

}


export function DeleteTeamForm({ teamId, onClose, onDelete }: DeleteFormProps<TeamBasic> & { teamId: string }) {

    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<Pick<TeamFormData, 'teamId'>>({
        resolver: zodResolver(teamFormSchema.pick({ teamId: true })),
        defaultValues: { teamId }
    })

    const mutation = useMutation(trpc.teams.sys_delete.mutationOptions({
        async onMutate() {
            await queryClient.cancelQueries(trpc.teams.all.queryFilter())
            await queryClient.cancelQueries(trpc.teams.byId.queryFilter({ teamId }))

            const previousAll = queryClient.getQueryData(trpc.teams.all.queryKey())
            const previousById = queryClient.getQueryData(trpc.teams.byId.queryKey({ teamId }))
            
            queryClient.setQueryData(trpc.teams.all.queryKey(), (oldData) => oldData?.filter(t => t.id !== teamId))
            queryClient.setQueryData(trpc.teams.byId.queryKey({ teamId }), undefined)
            
            onClose()
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
                description: <>The team <ObjectName>{result.name}</ObjectName> has been deleted successfully.</>,
            })
            onDelete?.(result)
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teams.all.queryFilter())
            queryClient.invalidateQueries(trpc.teams.byId.queryFilter({ teamId }))
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
            <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                    <TeamValue teamId={teamId}/>
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} variant="destructive"/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </Form>
    </FormProvider>
}
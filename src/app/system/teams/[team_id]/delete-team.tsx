/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useRouter } from 'next/navigation'
import {} from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormControl, FormActions, FormItem, FormLabel, FormSubmitButton, FormCancelButton, SubmitVerbs, FixedFormValue } from '@/components/ui/form'
import { Paragraph } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { TeamFormData, teamFormSchema } from '@/lib/forms/team'
import { useTRPC } from '@/trpc/client'
import * as Paths from '@/paths'





export function DeleteTeamDialog({ teamId, ...props }: React.ComponentProps<typeof Dialog> & { teamId: string }) {
    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Team</DialogTitle>
                <Paragraph>This action will permanently delete the team.</Paragraph>
            </DialogHeader>
            <DialogBody>
                <DeleteTeamForm teamId={teamId} onClose={() => props.onOpenChange?.(false)} />
            </DialogBody>
        </DialogContent>
    </Dialog>
}


function DeleteTeamForm({ teamId, onClose }: { teamId: string, onClose: () => void }) {

    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))

    const form = useForm<Pick<TeamFormData, 'teamId'>>({
        resolver: zodResolver(teamFormSchema.pick({ teamId: true })),
        defaultValues: { teamId: team.id}
    })

    const mutation = useMutation(trpc.teams.delete.mutationOptions({
        async onMutate() {
            await queryClient.cancelQueries(trpc.teams.all.queryFilter())
            await queryClient.cancelQueries(trpc.teams.byId.queryFilter({ teamId }))

            const previousTeams = queryClient.getQueryData(trpc.teams.all.queryKey())
            if (previousTeams) {
                queryClient.setQueryData(trpc.teams.all.queryKey(), previousTeams.filter(t => t.id !== teamId))
            }

            onClose()
            router.push(Paths.system.teams.index)
            return { previousTeams }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.teams.all.queryKey(), context?.previousTeams)
            toast({
                title: 'Error deleting team',
                description: error.message,
                variant: 'destructive'
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teams.all.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="max-w-xl space-y-4">
            <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                    <FixedFormValue value={team.name}/>
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} variant="destructive"/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}
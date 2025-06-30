

import { ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DeleteFormProps, FixedFormValue, FormActions, FormCancelButton, FormControl, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema } from '@/lib/forms/team-membership'
import { PersonBasic, TeamBasic, TeamMembershipBasic, useTRPC } from '@/trpc/client'



export function DeleteTeamMembershipDialog({ person, team, ...props }: ComponentProps<typeof Dialog> & { person: PersonBasic, team: TeamBasic }) {
   
    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Team Membership</DialogTitle>
                <DialogDescription>
                    This action will permanently remove the team membership for <ObjectName>{person.name}</ObjectName> in <ObjectName>{team.name}</ObjectName>.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <DeleteTeamMembershipForm person={person} team={team} onClose={() => props.onOpenChange?.(false)} />
            </DialogBody>
        </DialogContent>
    </Dialog>
}


export function DeleteTeamMembershipForm({ person, team, onClose }: DeleteFormProps<TeamMembershipBasic> & { person: PersonBasic, team: TeamBasic }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<Pick<SystemTeamMembershipFormData, 'personId' | 'teamId'>>({
        resolver: zodResolver(systemTeamMembershipFormSchema.pick({ personId: true, teamId: true })),
        defaultValues: { personId: person.id, teamId: team.id }
    })

    const mutation = useMutation(trpc.teamMemberships.delete.mutationOptions({
        async onMutate({ personId, teamId }) {
            await queryClient.cancelQueries(trpc.teamMemberships.byPerson.queryFilter({ personId }))
            await queryClient.cancelQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId }))

            const previousByPerson = queryClient.getQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }))
            const previousByTeam = queryClient.getQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }))

            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }), (oldData) => oldData?.filter(m => m.teamId !== teamId))
            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }), (oldData) => oldData?.filter(m => m.personId !== personId))

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
            onClose()
        },
        async onSuccess() {
            toast({
                title: 'Team membership deleted',
                description: <>Successfully removed <ObjectName>{person.name}</ObjectName> from <ObjectName>{team.name}</ObjectName>.</>
            })
            onClose()
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: person.id }))
            queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: team.id }))
        }
        
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className='max-w-xl space-y-4'>
            <FormItem>
                <FormLabel>Person</FormLabel>
                <FormControl>
                    <FixedFormValue value={person.name}/>
                </FormControl>
            </FormItem>
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
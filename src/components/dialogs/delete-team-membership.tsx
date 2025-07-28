/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { TrashIcon } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTriggerButton } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormActions, FormCancelButton, FormControl, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { TeamMembershipData, teamMembershipSchema } from '@/lib/schemas/team-membership'
import { useTRPC } from '@/trpc/client'



export function DeleteTeamMembershipDialog({ onDelete, personId, teamId }: { onDelete: (membership: TeamMembershipData) => void , personId: string, teamId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: { person, team } } = useSuspenseQuery(trpc.teamMemberships.byId.queryOptions({ personId, teamId }))

    const [open, setOpen] = useState(false)

    const form = useForm<Pick<TeamMembershipData, 'personId' | 'teamId'>>({
        resolver: zodResolver(teamMembershipSchema.pick({ personId: true, teamId: true })),
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
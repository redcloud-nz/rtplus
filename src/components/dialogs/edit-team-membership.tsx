/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FixedFormValue, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ObjectName } from '@/components/ui/typography'

import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema } from '@/lib/forms/team-membership'
import { useToast } from '@/hooks/use-toast'
import { PersonBasic, TeamBasic, TeamMembershipBasic, useTRPC } from '@/trpc/client'





export function EditTeamMembershipDialog_sys({ membership, person, team, ...props }: ComponentProps<typeof Dialog> & { membership: TeamMembershipBasic, person: PersonBasic, team: TeamBasic }) {

    return <Dialog {...props}>     
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Team Membership</DialogTitle>
                <DialogDescription>
                    Edit the team membership for <ObjectName>{person.name}</ObjectName> in <ObjectName>{team.name}</ObjectName>.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <EditTeamMembershipForm_sys 
                    membership={membership} 
                    person={person} 
                    team={team}
                    onClose={() => props.onOpenChange?.(false)} 
                    />
            </DialogBody>
        </DialogContent>
    </Dialog>
}


function EditTeamMembershipForm_sys({ membership, person, team, onClose  }: { membership: TeamMembershipBasic, person: PersonBasic, team: TeamBasic, onClose: () => void }) {
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
        onSuccess({ team, person }) {
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
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="max-w-xl space-y-4">
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
        </form>
    </FormProvider>
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { type ReactNode, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FixedFormValue, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { TeamMembershipFormData, teamMembershipFormSchema } from '@/lib/forms/team-membership'
import { nanoId8 } from '@/lib/id'
import { useTRPC } from '@/trpc/client'



/**
 * Dialog that allows the user to add a new team membership for a person.
 * @param personId The ID of the person for whom to add a team membership.
 * @param onClose A callback function that is called when the form is submitted successfully or canceled.
 */
export function AddTeamMembershipDialog({ personId, trigger }: { personId: string, trigger: ReactNode }) {
    const [open, setOpen] = useState(false)

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Team Membership</DialogTitle>
                <DialogDescription>
                    Add a new team membership to this person.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                { open ? <AddTeamMembershipForm personId={personId} onClose={() => setOpen(false)} /> : null }
            </DialogBody>
        </DialogContent>
    </Dialog>
}


/**
 * Form that allows the user to add a new team membership.
 * @param personId The ID of the person for whom to add a team membership.
 * @param onClose A callback function that is called when the form is submitted successfully or canceled.
 */
function AddTeamMembershipForm({ personId, onClose }: { personId: string, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()
    
    const { data: memberships } = useSuspenseQuery(trpc.teamMemberships.byPerson.queryOptions({ personId }))
    const { data: person } = useSuspenseQuery(trpc.personnel.byId.queryOptions({ personId }))
    const { data: teams } = useSuspenseQuery(trpc.teams.all.queryOptions())

    const newMembershipId = useMemo(() => nanoId8(), [])

    const form = useForm<TeamMembershipFormData>({
        resolver: zodResolver(teamMembershipFormSchema),
        defaultValues: {
            teamId: '',
            personId,
            role: 'None',
            status: 'Active',
        }
    })

    function handleClose() {
        onClose()
        form.reset()
    }
    
    const mutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        async onMutate(newMembership) {
            await queryClient.cancelQueries(trpc.teamMemberships.byPerson.queryFilter({ personId }))
            
            // Snapshot the previous value
            const previousByPerson = queryClient.getQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }))
            
            // Optimistically update the cache
            const team = teams.find(t => t.id === newMembership.teamId)!
            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }), (oldData) => [...(oldData || []), { ...newMembership, id: newMembershipId, team }])

            return { previousByPerson }
        },
        onError(error, data, context) {
            // Rollback the optimistic update
            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }), context?.previousByPerson)

            toast({
                title: "Error adding team membership",
                description: error.message,
                variant: 'destructive',
            })
            handleClose()
        },
        onSuccess(newMembership) {
            toast({
                title: "Team membership added",
                description: `${newMembership.person.name} has been added to the team ${newMembership.team.name}.`,
            })
            handleClose()
        },
        onSettled(newMembership) {
            if(newMembership) {
                queryClient.invalidateQueries(trpc.teamMemberships.byPerson.queryFilter({ personId: newMembership.personId }))
                queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: newMembership.teamId }))
            }
        }
    }))

    // The teams that the person is already a member of
    const currentTeams = memberships.map(m => m.team.id)

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="max-w-xl space-y-4">
            <FormItem>
                <FormLabel>Person</FormLabel>
                <FormControl>
                    <FixedFormValue value={person.name}/>
                </FormControl>
            </FormItem>
            <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => <FormItem>
                    <FormLabel>Team</FormLabel>
                    <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Team to add..."/>
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map(team => 
                                    <SelectItem 
                                        key={team.id} 
                                        value={team.id}
                                        disabled={currentTeams.includes(team.id)}
                                    >{team.name}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className='w-1/2'>
                                <SelectValue placeholder="Select role..."/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Member">Member</SelectItem>
                            </SelectContent>
                        </Select>
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
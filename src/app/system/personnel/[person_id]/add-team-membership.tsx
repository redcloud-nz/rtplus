/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { type ReactNode, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { TeamMembershipFormData, teamMembershipFormSchema } from '@/lib/forms/team-membership'
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
                    Add a new team membership for this person.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                { open ? <AddTeamMembershipForm personId={personId} onClose={() => setOpen(false)}/> : null }
            </DialogBody>
        </DialogContent>
    </Dialog>
}


/**
 * Form that allows the user to add a new team membership for a person.
 * @param personId The ID of the person for whom to add a team membership.
 * @param onClose A callback function that is called when the form is submitted successfully or canceled.
 */
function AddTeamMembershipForm({ personId, onClose }: { personId: string, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()
    
    const { data: teams } = useSuspenseQuery(trpc.teams.all.queryOptions())
    const { data: memberships } = useSuspenseQuery(trpc.teamMemberships.byPerson.queryOptions({ personId }))

    const form = useForm<TeamMembershipFormData>({
        resolver: zodResolver(teamMembershipFormSchema),
        defaultValues: {
            teamId: '',
            personId,
            role: 'None'
        }
    })
    
    const mutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        onSuccess(newMembership) {
            toast({
                title: "Team membership added",
                description: `${newMembership.person.name} has been added to the ${newMembership.team.name}.`,
            })
            handleClose()

            queryClient.invalidateQueries(
                trpc.teamMemberships.byPerson.queryFilter({ personId }), 
            )
            queryClient.invalidateQueries(
                trpc.teamMemberships.byTeam.queryFilter({ teamId: newMembership.teamId })
            )
        }
    }))

    async function handleClose() {
        onClose()
        form.reset()
    }

    // The teams that the person is already a member of
    const currentTeams = memberships.map(m => m.team.id)

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="max-w-xl space-y-4">
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
                            <SelectTrigger>
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
                <FormSubmitButton
                    labels={{
                        ready: 'Add',
                        submitting: 'Adding...',
                        submitted: 'Added',
                    }}/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </form>
    </FormProvider>
}
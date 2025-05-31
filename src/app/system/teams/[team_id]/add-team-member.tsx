/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { type ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormControl, FormActions, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, FormCancelButton } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema } from '@/lib/forms/system-team-membership'
import { useTRPC } from '@/trpc/client'



export function AddTeamMemberDialog({ teamId, ...props }: ComponentProps<typeof Dialog> & { teamId: string }) {
    return <Dialog {...props}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Add a new member to this team.
                    </DialogDescription>
                </DialogHeader>
                { props.open ? <AddTeamMemberForm 
                    teamId={teamId}
                    onClose={() => props.onOpenChange?.(false)}
                /> : null }
            </DialogContent>
        </Dialog>
}


function AddTeamMemberForm({ teamId, onClose }: { teamId: string,  onClose: () => void }) {

    const queryClient = useQueryClient()
    const trpc = useTRPC()

    const { data: personnel } = useSuspenseQuery(trpc.personnel.all.queryOptions())
    const { data: memberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))

    const form = useForm<SystemTeamMembershipFormData>({
        resolver: zodResolver(systemTeamMembershipFormSchema),
        defaultValues: {
            teamId,
            personId: '',
            role: 'None'
        }
    })

    const { toast } = useToast()

    const mutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        async onSuccess(newMembership) {
            toast({
                title: "Team membership added",
                description: `${newMembership.person.name} has been added to the ${newMembership.team.name}.`,
            })
            handleClose()

            queryClient.invalidateQueries(
                trpc.teamMemberships.byPerson.queryFilter({ personId: newMembership.personId }), 
            )
            queryClient.invalidateQueries(
                trpc.teamMemberships.byTeam.queryFilter({ teamId: newMembership.teamId })
            )
        }
    }))

    function handleClose() {
        onClose()
        form.reset()
    }

    const currentMembers = memberships.map(m => m.person.id)
    
    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((formData) => mutation.mutate(formData))} className="max-w-xl space-y-4">
            <FormField
                control={form.control}
                name="personId"
                render={({ field }) => <FormItem>
                    <FormLabel>Person</FormLabel>
                    <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Person to add..."/>
                            </SelectTrigger>
                            <SelectContent>
                                {personnel.map(person => 
                                    <SelectItem 
                                        key={person.id} 
                                        value={person.id}
                                        disabled={currentMembers.includes(person.id)}
                                    >{person.name}</SelectItem>
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
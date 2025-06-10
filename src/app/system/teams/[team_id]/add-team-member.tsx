/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ReactNode, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormControl, FormActions, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, FormCancelButton, FixedFormValue } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { SystemTeamMembershipFormData, systemTeamMembershipFormSchema } from '@/lib/forms/team-membership'
import { useTRPC } from '@/trpc/client'



export function AddTeamMemberDialog_sys({ teamId, trigger }: { teamId: string, trigger: ReactNode }) {
    const [open, setOpen] = useState(false)

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                    Add a new member to this team.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                { open ? <AddTeamMemberForm_sys teamId={teamId} onClose={() =>setOpen(false)} /> : null }
            </DialogBody>
        </DialogContent>
    </Dialog>
}


function AddTeamMemberForm_sys({ teamId, onClose }: { teamId: string,  onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: team } = useSuspenseQuery(trpc.teams.byId.queryOptions({ teamId }))
    const { data: personnel } = useSuspenseQuery(trpc.personnel.all.queryOptions())
    const { data: memberships } = useSuspenseQuery(trpc.teamMemberships.byTeam.queryOptions({ teamId }))

    const form = useForm<SystemTeamMembershipFormData>({
        resolver: zodResolver(systemTeamMembershipFormSchema),
        defaultValues: {
            teamId,
            personId: '',
            tags: [],
            status: 'Active',
        }
    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.teamMemberships.create.mutationOptions({
        async onSuccess(newMembership) {
            await queryClient.invalidateQueries(
                trpc.teamMemberships.byPerson.queryFilter({ personId: newMembership.personId }), 
            )
            await queryClient.invalidateQueries(
                trpc.teamMemberships.byTeam.queryFilter({ teamId: newMembership.teamId })
            )
            toast({
                title: "Team membership added",
                description: `${newMembership.person.name} has been added to the ${newMembership.team.name}.`,
            })
            handleClose()

            
        }
    }))

    const currentMembers = memberships.map(m => m.person.id)
    
    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((formData) => mutation.mutate(formData))} className="max-w-xl space-y-4">
            <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                    <FixedFormValue value={team.name}/>
                </FormControl>
            </FormItem>
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
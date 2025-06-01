/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ReactNode, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { pick } from 'remeda'

import { zodResolver } from '@hookform/resolvers/zod'
import { Team, TeamMembership } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FixedFormValue, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { TeamMembershipFormData, teamMembershipFormSchema } from '@/lib/forms/team-membership'
import { patchById } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { PersonBasic, useTRPC } from '@/trpc/client'





export function EditTeamMembershipDialog({ membership, person, team, trigger }: { membership: TeamMembership, person: PersonBasic, team: Team, trigger: ReactNode }) {
    const [open, setOpen] = useState(false)

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}        
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Team Membership</DialogTitle>
                <DialogDescription>
                    Edit the team membership for '{person.name}' in '{team.name}'.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                { open 
                    ? <EditTeamMembershipForm 
                        membership={membership} 
                        person={person} 
                        team={team}
                        onClose={() => setOpen(false)} 
                    />
                    : null
                }
            </DialogBody>
        </DialogContent>
    </Dialog>
}


function EditTeamMembershipForm({ membership, person, team, onClose  }: { membership: TeamMembership, person: PersonBasic, team: Team, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<TeamMembershipFormData>({
        resolver: zodResolver(teamMembershipFormSchema),
        defaultValues: pick(membership, ['personId', 'teamId', 'role', 'status'])
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

            queryClient.setQueryData(trpc.teamMemberships.byPerson.queryKey({ personId }), (oldData) => patchById(oldData, membership.id, update))
            queryClient.setQueryData(trpc.teamMemberships.byTeam.queryKey({ teamId }), (oldData) => patchById(oldData, membership.id, update))

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
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className="max-w-xl space-y-4">
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
                name="role"
                render={({ field }) => <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-1/2">
                                <SelectValue placeholder="Role..."/>
                            </SelectTrigger>
                            <SelectContent>
                                {['None', 'Member', 'Admin'].map(role => 
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage/>
                </FormItem>}
            />
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
                <FormSubmitButton
                    labels={{
                        ready: 'Update',
                        submitting: 'Updating...',
                        submitted: 'Updated'
                    }}
                />
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </form>
    </FormProvider>
}
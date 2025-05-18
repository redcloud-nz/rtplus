/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import * as React from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormSubmitButton, FormValue } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { TeamMembershipFormData, teamMembershipFormSchema } from '@/lib/forms/team-membership'
import { TeamMembershipWithPerson, useTRPC } from '@/trpc/client'



interface UpdateTeamMemberDialogProps {
    teamMembership: TeamMembershipWithPerson
    open: boolean
    onOpenChange: (newValue: boolean) => void
}

/**
 * Dialog for updating a team membership.
 */
export function UpdateTeamMemberDialog({ teamMembership, open, onOpenChange }: UpdateTeamMemberDialogProps) {
    const queryClient = useQueryClient()
    const trpc = useTRPC()
   

    const form = useForm<TeamMembershipFormData>({
        resolver: zodResolver(teamMembershipFormSchema),
        defaultValues: {
            teamId: teamMembership.teamId,
            personId: teamMembership.personId,
            role: teamMembership.role
        }
    })

    

    const mutation = useMutation(trpc.teamMemberships.update.mutationOptions())

    function handleOpenChange(newValue: boolean) {
        onOpenChange(newValue)
        if(!newValue) form.reset()
    }

    const handleSubmit = form.handleSubmit(async (formData) => {
        await mutation.mutateAsync(formData)
        queryClient.invalidateQueries(trpc.teamMemberships.byTeam.queryFilter({ teamId: teamMembership.teamId }))
        handleOpenChange(false)
    })

    return <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Update Team Membership</DialogTitle>
            </DialogHeader>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormItem>
                        <FormLabel>Person</FormLabel>
                        <FormValue>{teamMembership.person.name}</FormValue>
                    </FormItem>
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="None">None</SelectItem>
                                        <SelectItem value="Member">Member</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                        </FormItem>}
                    />
                    <FormActions>
                        <FormSubmitButton
                            labels={{
                                ready: 'Update',
                                submitting: 'Updating...',
                                submitted: 'Updated',
                            }}
                        />
                        <FormCancelButton onClick={() => handleOpenChange(false)}/>
                    </FormActions>
                </form>
            </FormProvider>
        </DialogContent>
    </Dialog>
}
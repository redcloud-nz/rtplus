/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { TeamInvitationData, teamInvitationSchema } from '@/lib/schemas/invitation'
import { TeamData } from '@/lib/schemas/team'
import { trpc } from '@/trpc/client'



export function Team_CreateInvitation_Dialog({ team, trigger }: { team: TeamData, trigger: React.ReactNode }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const [open, setOpen] = useState(false)

    const form = useForm<Pick<TeamInvitationData, 'email' | 'role'>>({
        resolver: zodResolver(teamInvitationSchema.pick({ email: true, role: true })),
        defaultValues: {
            email: '',
            role: 'org:member', // Default role for new invites
        },
    })

    function handleClose() {
        setOpen(false)
        form.reset()
    }

    const mutation = useMutation(trpc.users.createTeamInvitation.mutationOptions({
        async onSuccess(data) {
            await queryClient.invalidateQueries(trpc.users.getTeamInvitations.queryFilter({ teamId: team.teamId }))
            toast({
                title: 'Invitation sent',
                description: `The invitation to ${data.email} has been sent successfully.`,
            })
            handleClose()
        },
        async onError(error) {
            toast({
                title: 'Error sending invitation',
                description: error.message,
                variant: 'destructive',
            })
            handleClose()
        },
    }))

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create Invitation</DialogTitle>
                <DialogDescription>
                    Create a new invitation to access your team.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <FormProvider {...form}>
                    <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync({ ...formData, teamId: team.teamId }))}>
                        <FormField 
                            control={form.control}
                            name="email"
                            render={({ field }) => <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field}/>
                                </FormControl>
                                <FormDescription>The email address of the person to invite.</FormDescription>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormField 
                            control={form.control}
                            name="role"
                            render={({ field }) => <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <Select {...field} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-1/2">
                                            <SelectValue/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="org:member">Member</SelectItem>
                                            <SelectItem value="org:admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormDescription>The role to assign to the invited user.</FormDescription>
                                <FormMessage/>
                            </FormItem>}
                        />
                        <FormActions>
                            <FormSubmitButton labels={{
                                ready: 'Invite',
                                validating: 'Validating...',
                                submitting: 'Inviting...',
                                submitted: 'Invited',
                            }}/>
                            <FormCancelButton onClick={handleClose}/>
                        </FormActions>
                    </Form>
                </FormProvider>
            </DialogBody>
        </DialogContent>
    </Dialog>

}
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
import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { OrgInvitationFormData, orgInvitationFormSchema } from '@/lib/schemas/org-invitation'
import { useTRPC } from '@/trpc/client'


export function CreateInvitationDialog({ trigger }: { trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false)

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
                <CreateInvitationForm onClose={() => setOpen(false)} />
            </DialogBody>
        </DialogContent>
    </Dialog>

}

function CreateInvitationForm({ onClose }: { onClose: () => void }) {
    
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<OrgInvitationFormData>({
        resolver: zodResolver(orgInvitationFormSchema),
        defaultValues: {
            email: '',
            role: 'org:member', // Default role for new invites
        },
    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.orgInvitations.create.mutationOptions({
        async onSuccess(data) {
            await queryClient.invalidateQueries(trpc.orgInvitations.byCurrentTeam.queryFilter())
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

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className="w-max-xl space-y-4">
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
                        <Select {...field}>
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
        </form>
    </FormProvider>
}
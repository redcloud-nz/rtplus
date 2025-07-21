/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ComponentProps, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/hooks/use-toast'
import { OrgInvitationData, orgInvitationSchema } from '@/lib/schemas/org-invitation'
import { useTRPC } from '@/trpc/client'
import { z } from 'zod'


export function RevokeInvitationDialog({ orgInvitation, ...props }: ComponentProps<typeof Dialog> & { orgInvitation: OrgInvitationData }) {

    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Revoke Invitation</DialogTitle>
                <DialogDescription>
                    This action will revoke the invitation for <strong>{orgInvitation.email}</strong> to join your team.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <RevokeInvitationForm orgInvitation={orgInvitation} onClose={() => props.onOpenChange?.(false)} />
            </DialogBody>
        </DialogContent>
    </Dialog>
}

function RevokeInvitationForm({ orgInvitation, onClose }: { orgInvitation: OrgInvitationData, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm({
        resolver: zodResolver(z.object({ invitationId: z.string() })),
        defaultValues: { invitationId: orgInvitation.invitationId }
    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.orgInvitations.revoke.mutationOptions({
        async onMutate({ invitationId }) {
            await queryClient.cancelQueries(trpc.orgInvitations.byCurrentTeam.queryFilter())

            const previousData = queryClient.getQueryData(trpc.orgInvitations.byCurrentTeam.queryKey())
            if(previousData) {
                 queryClient.setQueryData(trpc.orgInvitations.byCurrentTeam.queryKey(), previousData.filter(inv => inv.id !== invitationId))
            }
           
            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.orgInvitations.byCurrentTeam.queryKey(), context?.previousData)
            toast({
                title: 'Error revoking invitation',
                description: error.message,
                variant: 'destructive'
            })
            handleClose()
        },
        onSuccess() {
            toast({
                title: 'Invitation revoked',
                description: `The invitation for ${orgInvitation.email} has been successfully revoked.`,
            })
            handleClose()
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.orgInvitations.byCurrentTeam.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className="w-max-xl space-y-4">
            <FormField
                control={form.control}
                name="invitationId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Invitation ID</FormLabel>
                        <FormControl>
                            <Input type="text" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormActions>
                <FormSubmitButton labels={{
                    ready: 'Revoke',
                    validating: 'Validating...',
                    submitting: 'Revoking...',
                    submitted: 'Revoked',
                }}/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
            </form>
        </FormProvider>
}
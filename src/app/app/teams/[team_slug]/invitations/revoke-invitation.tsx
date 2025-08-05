/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { TeamInvitationData } from '@/lib/schemas/invitation'
import { useTRPC } from '@/trpc/client'



export function RevokeInvitationDialog({ orgInvitation, ...props }: ComponentProps<typeof Dialog> & { orgInvitation: TeamInvitationData }) {

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

function RevokeInvitationForm({ orgInvitation, onClose }: { orgInvitation: TeamInvitationData, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const queryKey = trpc.activeTeam.invitations.all.queryKey()

    const form = useForm({
        resolver: zodResolver(z.object({ invitationId: z.string() })),
        defaultValues: { invitationId: orgInvitation.invitationId }
    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.activeTeam.invitations.revoke.mutationOptions({
        async onMutate({ invitationId }) {
            await queryClient.cancelQueries(trpc.activeTeam.invitations.all.queryFilter())

            const previousData = queryClient.getQueryData(queryKey)
            if(previousData) {
                 queryClient.setQueryData(queryKey, previousData.filter(inv => inv.invitationId !== invitationId))
            }
           
            return { previousData }
        },
        onError(error, _, context) {
            queryClient.setQueryData(queryKey, context?.previousData)
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
            queryClient.invalidateQueries(trpc.activeTeam.invitations.all.queryFilter())
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
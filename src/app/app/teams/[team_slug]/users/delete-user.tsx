/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DisplayValue } from '@/components/ui/display-value'
import { FormActions, FormCancelButton, FormControl, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'

import { useToast } from '@/hooks/use-toast'
import { OrgMembershipFormData, orgMembershipFormSchema } from '@/lib/schemas/org-membership'
import { OrgMembershipData, useTRPC } from '@/trpc/client'



export function DeleteUserDialog({ orgMembership, ...props }: ComponentProps<typeof Dialog> & { orgMembership: OrgMembershipData }) {

    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                    This action will permanently remove the user {orgMembership.user.name} from the organization.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <DeleteUserForm orgMembership={orgMembership} onClose={() => props.onOpenChange?.(false)} />
            </DialogBody>
        </DialogContent>
    </Dialog>
}

function DeleteUserForm({ orgMembership, onClose }: { orgMembership: OrgMembershipData, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<Pick<OrgMembershipFormData, 'userId'>>({
        resolver: zodResolver(orgMembershipFormSchema.pick({ userId: true })),
        defaultValues: { userId: orgMembership.user.id }
    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.orgMemberships.delete.mutationOptions({
        async onMutate({ userId }) {
            await queryClient.cancelQueries(trpc.orgMemberships.byCurrentTeam.queryFilter())

            const previousData = queryClient.getQueryData(trpc.orgMemberships.byCurrentTeam.queryKey())
            if (previousData) {
                queryClient.setQueryData([trpc.orgMemberships.byCurrentTeam.queryKey], previousData.filter(m => m.user.id !== userId))
            }
            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.orgMemberships.byCurrentTeam.queryKey(), context?.previousData)

            toast({ 
                title: 'Error deleting user',
                description: error.message,
                variant: 'destructive'
            })
            handleClose()
        },
        onSuccess() {
            toast({ 
                title: 'User deleted successfully',
                description: `User ${orgMembership.user.name} has been removed from the organization.`,
             })
            handleClose()
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.orgMemberships.byCurrentTeam.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="space-y-4">
            <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <DisplayValue>{orgMembership.user.name}</DisplayValue>
                </FormControl>
            </FormItem>
            <FormItem>
                <FormLabel>Identifier</FormLabel>
                <FormControl>
                    <DisplayValue>{orgMembership.user.identifier}</DisplayValue>
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} />
                <FormCancelButton onClick={handleClose} />
            </FormActions>
        </form>
    </FormProvider>
}
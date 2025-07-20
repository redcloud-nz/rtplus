/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DisplayValue, FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrgMembershipFormData, orgMembershipFormSchema } from '@/lib/schemas/org-membership'
import { OrgMembershipData, useTRPC } from '@/trpc/client'



export function EditUserDialog({ orgMembership, ...props }: { orgMembership: OrgMembershipData } & React.ComponentProps<typeof Dialog>) {

    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                    Edit the user details for <ObjectName>{orgMembership.user.name}</ObjectName> in team <ObjectName>{orgMembership.organization.name}</ObjectName>.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <EditUserForm orgMembership={orgMembership} onClose={() => props.onOpenChange?.(false)} />
            </DialogBody>
        </DialogContent>
    </Dialog>
}


function EditUserForm({ orgMembership, onClose }: { orgMembership: OrgMembershipData, onClose: () => void }) {

    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const form = useForm<OrgMembershipFormData>({
        resolver: zodResolver(orgMembershipFormSchema),
        defaultValues: {
            userId: orgMembership.user.id,
            role: orgMembership.role as 'org:admin' | 'org:member',
        }
    })

    function handleClose() {
        onClose()
        form.reset()
    }

    const mutation = useMutation(trpc.orgMemberships.update.mutationOptions({
        async onMutate() {
            await queryClient.cancelQueries(trpc.orgMemberships.byCurrentTeam.queryFilter())

            const previousData = queryClient.getQueryData(trpc.orgMemberships.byCurrentTeam.queryKey())
            if (previousData) {
                queryClient.setQueryData([trpc.orgMemberships.byCurrentTeam.queryKey], previousData.map(m => m.id === orgMembership.id ? { ...m, ...form.getValues() } : m))
            }
            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.orgMemberships.byCurrentTeam.queryKey(), context?.previousData)

            toast({
                title: 'Error updating user',
                description: error.message,
                variant: 'destructive',
            })
            handleClose()
        },
        onSuccess() {
            toast({
                title: 'User updated',
                description: `Successfully updated ${orgMembership.user.name}'s role to ${form.getValues().role === 'org:admin' ? 'Admin' : 'Member'} in team ${orgMembership.organization.name}.`,
            })
            handleClose()

        },
        onSettled() {
            queryClient.invalidateQueries(trpc.orgMemberships.byCurrentTeam.queryFilter())
            
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))} className="max-w-xl space-y-4">
            <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <DisplayValue value={orgMembership.user.name}/>
                </FormControl>
            </FormItem>
            <FormItem>
                <FormLabel>Identifier</FormLabel>
                <FormControl>
                    <DisplayValue value={orgMembership.user.identifier}/>
                </FormControl>
            </FormItem>
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                            <Select {...field} onValueChange={field.onChange}>
                                <SelectTrigger className="1/2">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="org:admin">Admin</SelectItem>
                                    <SelectItem value="org:member">Member</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.update}/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </form>
    </FormProvider>
}
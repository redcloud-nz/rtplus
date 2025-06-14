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
import { FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { SkillPackageFormData, skillPackageFormSchema } from '@/lib/forms/skill-package'
import { useToast } from '@/hooks/use-toast'
import { useTRPC } from '@/trpc/client'



export function EditSkillPackageDialog_sys({ skillPackageId, trigger }: { skillPackageId: string, trigger: ReactNode }) {
    const [open, setOpen] = useState(false)

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Skill Package</DialogTitle>
                <DialogDescription>
                    Edit the details of this skill package.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                {open ? <EditSkillPackageForm_sys skillPackageId={skillPackageId} onClose={() => setOpen(false)} /> : null}
            </DialogBody>
        </DialogContent>
    </Dialog>
}


function EditSkillPackageForm_sys({ skillPackageId, onClose }: { skillPackageId: string, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillPackage } = useSuspenseQuery(trpc.skillPackages.byId.queryOptions({ skillPackageId }))

    const form = useForm<SkillPackageFormData>({
        resolver: zodResolver(skillPackageFormSchema),
        defaultValues: {
            skillPackageId,
            name: skillPackage.name,
            status: skillPackage.status,
        }
    })

    const mutation = useMutation(trpc.skillPackages.sys_update.mutationOptions({
        async onMutate({ skillPackageId, ...formData }) {
            await queryClient.cancelQueries(trpc.skillPackages.byId.queryFilter({ skillPackageId }))
            
            const previousData = queryClient.getQueryData(trpc.skillPackages.byId.queryKey({ skillPackageId }))
            if (previousData) {
                queryClient.setQueryData(trpc.skillPackages.byId.queryKey({ skillPackageId }), {
                    ...previousData, ...formData
                })
            }
            onClose()
            return { previousData }
        },
        onError(error, data, context) {
            queryClient.setQueryData(trpc.skillPackages.byId.queryKey({ skillPackageId }), context?.previousData)

            toast({ title: 'Error updating skill package', description: error.message, variant: 'destructive' })
        },
        async onSuccess() {
            toast({ 
                title: 'Skill package updated', 
                description: 'The skill package has been updated successfully.'
            })
        },
        onSettled() {
            queryClient.invalidateQueries(trpc.skillPackages.byId.queryFilter({ skillPackageId }))
            queryClient.invalidateQueries(trpc.skillPackages.all.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((formData) => mutation.mutate(formData))} className="max-w-2xl space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => 
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                }
            />
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => 
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="w-1/2">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                }
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.update}/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}
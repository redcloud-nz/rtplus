/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { pick } from 'remeda'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { SkillPackageFormData, skillPackageFormSchema } from '@/lib/forms/skill-package'
import { useToast } from '@/hooks/use-toast'
import { useTRPC } from '@/trpc/client'



export function EditSkillPackageDialog({ skillPackageId, ...props }: ComponentProps<typeof Dialog> & { skillPackageId: string }) {
    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Skill Package</DialogTitle>
                <DialogDescription>
                    Edit the details of this skill package.
                </DialogDescription>
            </DialogHeader>
            <DialogBody>
                <EditSkillPackageForm 
                    skillPackageId={skillPackageId} 
                    onClose={() => props.onOpenChange?.(false)} 
                />
            </DialogBody>
        </DialogContent>
    </Dialog>
}


function EditSkillPackageForm({ skillPackageId, onClose }: { skillPackageId: string, onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillPackage } = useSuspenseQuery(trpc.skillPackages.byId.queryOptions({ skillPackageId }))

    const form = useForm<SkillPackageFormData>({
        resolver: zodResolver(skillPackageFormSchema),
        defaultValues: { skillPackageId, ...pick(skillPackage, ['description', 'name', 'status']) }
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skillPackages.sys_update.mutationOptions({
        onError(error) {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillPackageFormData, { message: error.shape.message })
            } else {
                    toast({
                    title: 'Error updating skill package',
                    description: error.message,
                    variant: 'destructive'
                })
                handleClose()
            }
        },
        async onSuccess(result) {
            toast({ 
                title: 'Skill package updated', 
                description: `The skill package ${result.name} has been updated successfully.`
            })
            handleClose()

            await queryClient.invalidateQueries(trpc.skillPackages.all.queryFilter())
            await queryClient.invalidateQueries(trpc.skillPackages.byId.queryFilter({ skillPackageId }))
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((formData) => mutation.mutateAsync(formData))} className="max-w-2xl space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => 
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormDescription>The name of the skill package.</FormDescription>
                        <FormMessage />
                    </FormItem>
                }
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Package Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} />
                        </FormControl>
                        <FormDescription>A description of what this skill package contains and who it applies to.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
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
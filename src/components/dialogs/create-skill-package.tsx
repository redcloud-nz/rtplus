/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useState, type ReactNode, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { useToast } from '@/hooks/use-toast'
import { SkillPackageFormData, skillPackageFormSchema } from '@/lib/forms/skill-package'
import { nanoId8 } from '@/lib/id'
import { SkillPackage, useTRPC } from '@/trpc/client'


type CreateSkillPackageProps = {
    onCreate?: (skillPackage: SkillPackage) => void,
}

export function CreateSkillPackageDialog({ trigger, ...props }: CreateSkillPackageProps & { trigger: ReactNode }) {

    const [open, setOpen] = useState(false)

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Skill Package</DialogTitle>
                <DialogDescription>Create a new skill package.</DialogDescription>
            </DialogHeader>
            <DialogBody>
                {open ? <CreateSkillPackageForm 
                    onClose={() => setOpen(false)} 
                    {...props}
                /> : null}
            </DialogBody>
        </DialogContent>
    </Dialog>
}


function CreateSkillPackageForm({ onClose, onCreate }: CreateSkillPackageProps & { onClose: () => void}) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const skillPackageId = useMemo(() => nanoId8(), [])

    const form = useForm<SkillPackageFormData>({
        resolver: zodResolver(skillPackageFormSchema),
        defaultValues: {
            skillPackageId,
            name: '',
            description: '',
            status: 'Active',
        },
    })
    
    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skillPackages.sys_create.mutationOptions({
        onError(error) {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillPackageFormData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error creating skill package',
                    description: error.message,
                    variant: 'destructive',
                })
                handleClose()
            }
        },
        async onSuccess(skillPackage) {
            toast({
                title: 'Skill package created',
                description: `The skill package ${skillPackage.name} has been successfully created`,
            })
            handleClose()
            onCreate?.(skillPackage)

            await queryClient.invalidateQueries(trpc.skillPackages.all.queryFilter())
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className="max-w-2xl space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Package Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormDescription>The name of the skill package.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
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
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.create}/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}
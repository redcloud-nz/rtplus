/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useState, type ReactNode, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormActions, FormCancelButton, FormControl, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { useToast } from '@/hooks/use-toast'
import { SkillPackageFormData, skillPackageFormSchema } from '@/lib/forms/skill-package'
import { nanoId8 } from '@/lib/id'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'



export function CreateSkillPackageDialog_sys({ trigger }: { trigger: ReactNode }) {

    const [open, setOpen] = useState(false)

    return <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Skill Package</DialogTitle>
                <DialogDescription>Create a new skill package.</DialogDescription>
            </DialogHeader>
            <DialogBody>
                {open ? <CreateSkillPackageForm_sys onClose={() => setOpen(false)} /> : null}
            </DialogBody>
        </DialogContent>
    </Dialog>
}
function CreateSkillPackageForm_sys({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const skillPackageId = useMemo(() => nanoId8(), [])

    const form = useForm<SkillPackageFormData>({
        resolver: zodResolver(skillPackageFormSchema),
        defaultValues: {
            skillPackageId,
            name: '',
            status: 'Active',
        },
    })
    
    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skillPackages.sys_create.mutationOptions({
        onError(error) {
            toast({
                title: 'Error creating skill package',
                description: error.message,
                variant: 'destructive',
            })
            handleClose()
        },
        async onSuccess() {
            await queryClient.invalidateQueries(trpc.skillPackages.all.queryFilter())
            toast({
                title: 'Skill package created',
                description: 'The skill package has been successfully created.',
            })
            handleClose()
            router.push(Paths.system.skillPackages.skillPackage(skillPackageId).index)
        }
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
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
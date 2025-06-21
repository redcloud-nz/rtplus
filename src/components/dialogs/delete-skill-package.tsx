/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FixedFormValue, FormActions, FormCancelButton, FormControl, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Paragraph } from '@/components/ui/typography'

import { SkillPackageFormData } from '@/lib/forms/skill-package'
import { useToast } from '@/hooks/use-toast'
import { SkillPackage, useTRPC } from '@/trpc/client'


type DeleteSkillPackageDialogProps = ComponentProps<typeof Dialog> & {
    skillPackageId: string
    onDelete?: (skillPackage: SkillPackage) => void
}

export function DeleteSkillPackageDialog(props: DeleteSkillPackageDialogProps) {
    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill Package</DialogTitle>
                <Paragraph>This action will permanently delete the skill package.</Paragraph>
            </DialogHeader>
            <DialogBody>
                <DeleteSkillPackageForm {...props} />
            </DialogBody>
        </DialogContent>
    </Dialog>
}

export function DeleteSkillPackageForm({ onOpenChange, onDelete, skillPackageId }: DeleteSkillPackageDialogProps) {

    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillPackage } = useSuspenseQuery(trpc.skillPackages.byId.queryOptions({ skillPackageId }))

    const form = useForm<Pick<SkillPackageFormData, 'skillPackageId'>>({
        resolver: (data) => ({ values: data, errors: {} }),
        defaultValues: { skillPackageId: skillPackage.id }
    })

    function handleClose() {
        onOpenChange?.(false)
    }

    const mutation = useMutation(trpc.skillPackages.sys_delete.mutationOptions({
        onError(error) {
            toast({
                title: 'Error Deleting Skill Package',
                description: error.message,
                variant: 'destructive'
            })
            handleClose()
        },
        async onSuccess(result) {
            toast({
                title: 'Skill Package Deleted',
                description: `The skill package ${result.name} has been deleted.`,
            })
            handleClose()
            onDelete?.(result)

            await queryClient.invalidateQueries(trpc.skillPackages.all.queryFilter())
            await queryClient.invalidateQueries(trpc.skillPackages.byId.queryFilter({ skillPackageId }))
        },
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className='max-w-2xl space-y-4'>
            <FormItem>
                <FormLabel>Skill Package</FormLabel>
                <FormControl>
                    <FixedFormValue value={skillPackage.name} />
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} variant="destructive"/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </form>
    </FormProvider>
}
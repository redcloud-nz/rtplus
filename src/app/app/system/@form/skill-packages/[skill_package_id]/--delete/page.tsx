/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/skill-packages/[skill_package_id]/--delete
 */
'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormActions, FormItem, FormLabel, FormSubmitButton, FormCancelButton, SubmitVerbs, DeleteFormProps, FixedFormValue } from '@/components/ui/form'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SkillPackageFormData, skillPackageFormSchema } from '@/lib/forms/skill-package'
import * as Paths from '@/paths'
import { SkillPackage, useTRPC } from '@/trpc/client'





export default function DeleteSkillPackageDialog(props: { params: Promise<{ skill_package_id: string }> }) {
    const { skill_package_id: skillPackageId } = use(props.params)

    const router = useRouter()

    return <Dialog open onOpenChange={open => { if(!open) router.back() }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill Package</DialogTitle>
                <DialogDescription>Permanently delete skill package?</DialogDescription>
            </DialogHeader>
            <DialogBody>
                <DeleteSkillPackageForm
                    skillPackageId={skillPackageId}
                    onClose={() => router.back()}
                    onDelete={() => router.push(Paths.system.skillPackages.index)}
                />
            </DialogBody>
        </DialogContent>
    </Dialog>

}


export function DeleteSkillPackageForm({ onClose, onDelete, skillPackageId }: DeleteFormProps<SkillPackage> & { skillPackageId: string }) {

    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillPackage } = useSuspenseQuery(trpc.skillPackages.byId.queryOptions({ skillPackageId }))

    const form = useForm<Pick<SkillPackageFormData, 'skillPackageId'>>({
        resolver: zodResolver(skillPackageFormSchema.pick({ skillPackageId: true })),
        defaultValues: { skillPackageId: skillPackage.id }
    })

    const mutation = useMutation(trpc.skillPackages.sys_delete.mutationOptions({
        onError(error) {
            toast({
                title: 'Error Deleting Skill Package',
                description: error.message,
                variant: 'destructive'
            })
            onClose()
        },
        async onSuccess(result) {
            toast({
                title: 'Skill Package Deleted',
                description: <>The skill package <ObjectName>{result.name}</ObjectName> has been deleted.</>,
            })
            onClose()
            onDelete?.(result)

            await queryClient.invalidateQueries(trpc.skillPackages.all.queryFilter())
            await queryClient.invalidateQueries(trpc.skillPackages.byId.queryFilter({ skillPackageId }))
        },
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
            <FormItem>
                <FormLabel>Skill Package</FormLabel>
                <FormControl>
                    <FixedFormValue value={skillPackage.name} />
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} variant="destructive"/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </Form>
    </FormProvider>
}
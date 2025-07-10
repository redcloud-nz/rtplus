/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ComponentProps } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DisplayValue, FormActions, FormCancelButton, FormControl, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Paragraph } from '@/components/ui/typography'

import { SkillGroupFormData, skillGroupFormSchema } from '@/lib/forms/skill-group'
import { useToast } from '@/hooks/use-toast'
import { SkillGroup, useTRPC } from '@/trpc/client'



type DeleteSkillGroupProps = {
    onDelete?: (skillGroup: SkillGroup) => void
    skillGroupId: string
    
}

export function DeleteSkillGroupDialog({ onDelete, skillGroupId, ...props}: ComponentProps<typeof Dialog> & DeleteSkillGroupProps) {
    return <Dialog {...props}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete Skill Group</DialogTitle>
                <Paragraph>This action will permanently delete the skill group and all its skills.</Paragraph>
            </DialogHeader>
            <DialogBody>
                <DeleteSkillGroupForm 
                    skillGroupId={skillGroupId} 
                    onClose={() => props.onOpenChange?.(false)} 
                    onDelete={onDelete}
                />
            </DialogBody>
        </DialogContent>
    </Dialog>
}

export function DeleteSkillGroupForm({ onClose, onDelete, skillGroupId }: DeleteSkillGroupProps & { onClose: () => void }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillGroup } = useSuspenseQuery(trpc.skillGroups.byId.queryOptions({ skillGroupId }))

    const form = useForm<Pick<SkillGroupFormData, 'skillGroupId'>>({
        resolver: zodResolver(skillGroupFormSchema.pick({ skillGroupId: true })),
        defaultValues: { skillGroupId: skillGroup.id }
    })


    const mutation = useMutation(trpc.skillGroups.sys_delete.mutationOptions({
        onError(error) {
            toast({
                title: 'Error Deleting Skill Group',
                description: error.message,
                variant: 'destructive'
            })
            onClose()
        },
        async onSuccess(result) {
            toast({
                title: 'Skill Group Deleted',
                description: `The skill group ${result.name} has been deleted.`,
            })
            onClose()
            onDelete?.(result)

            await queryClient.invalidateQueries(trpc.skillGroups.all.queryFilter())
            await queryClient.invalidateQueries(trpc.skillGroups.byId.queryFilter({ skillGroupId }))
            await queryClient.invalidateQueries(trpc.skillGroups.bySkillPackageId.queryFilter({ skillPackageId: skillGroup.skillPackageId }))
        },
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className='max-w-2xl space-y-4'>
            <FormItem>
                <FormLabel>Skill Package</FormLabel>
                <FormControl>
                    <DisplayValue value={skillGroup.skillPackage.name} />
                </FormControl>
            </FormItem>
            <FormItem>
                <FormLabel>Skill Group</FormLabel>
                <FormControl>
                    <DisplayValue value={skillGroup.name} />
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} variant="destructive"/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}

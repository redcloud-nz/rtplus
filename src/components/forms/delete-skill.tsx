/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { FormProvider, useForm } from 'react-hook-form'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { DeleteFormProps, DisplayValue, FormActions, FormCancelButton, FormControl, FormItem, FormLabel, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'

import { SkillData } from '@/lib/schemas/skill'
import { useToast } from '@/hooks/use-toast'
import { SkillDataWithPackageAndGroup, useTRPC } from '@/trpc/client'


export function DeleteSkillForm({ onClose, onDelete, skillId }: DeleteFormProps<SkillDataWithPackageAndGroup> & { skillId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skill } = useSuspenseQuery(trpc.skills.byId.queryOptions({ skillId }))

    const form = useForm<Pick<SkillData, 'skillId'>>({
        resolver: (data) => ({ values: data, errors: {} }),
        defaultValues: { skillId: skill.id }
    })

    const mutation = useMutation(trpc.skills.delete.mutationOptions({
        onError(error) {
            toast({
                title: 'Error Deleting Skill',
                description: error.message,
                variant: 'destructive'
            })
            onClose()
        },
        async onSuccess(result) {
            toast({
                title: 'Skill Deleted',
                description: `The skill ${result.name} has been deleted.`,
            })
            onClose()
            onDelete?.(result)

            await queryClient.invalidateQueries(trpc.skills.all.queryFilter())
            await queryClient.invalidateQueries(trpc.skills.byId.queryFilter({ skillId }))
            await queryClient.invalidateQueries(trpc.skills.bySkillGroupId.queryFilter({ skillGroupId: skill.skillGroupId }))
        },
    }))

    return <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))} className='max-w-2xl space-y-4'>
            <FormItem>
                <FormLabel>Skill Package</FormLabel>
                <FormControl>
                    <DisplayValue value={skill.skillPackage.name} />
                </FormControl>
            </FormItem>
            { skill.skillGroup ? <FormItem>
                <FormLabel>Skill Group</FormLabel>
                <FormControl>
                    <DisplayValue value={skill.skillGroup.name} />
                </FormControl>
            </FormItem> : null }
            <FormItem>
                <FormLabel>Skill</FormLabel>
                <FormControl>
                    <DisplayValue value={skill.name} />
                </FormControl>
            </FormItem>
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.delete} variant="destructive"/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </form>
    </FormProvider>
}

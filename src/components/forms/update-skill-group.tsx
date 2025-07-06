/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { pick } from 'remeda'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { FixedFormValue, Form, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs, UpdateFormProps } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useToast } from '@/hooks/use-toast'
import { SkillGroupFormData, skillGroupFormSchema } from '@/lib/forms/skill-group'
import { SkillGroupWithPackage, useTRPC } from '@/trpc/client'


export function UpdateSkillGroupForm({ onClose, skillGroupId }: UpdateFormProps<SkillGroupWithPackage> & { skillGroupId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillGroup } = useSuspenseQuery(trpc.skillGroups.byId.queryOptions({ skillGroupId }))

    const form = useForm<SkillGroupFormData>({
        resolver: zodResolver(skillGroupFormSchema),
        defaultValues: {
            skillGroupId, ...pick(skillGroup, ['skillPackageId', 'parentId', 'name', 'description', 'status'])
        }
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skillGroups.sys_update.mutationOptions({
        onError: (error) => {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillGroupFormData, { message: error.shape.message })
            } else {
                 toast({
                    title: 'Error updating skill group',
                    description: error.message,
                    variant: 'destructive'
                })
                handleClose()
            }
        },
        async onSuccess(result) {
            toast({
                title: 'Skill Group Updated',
                description: `The skill group "${result.name}" has been updated successfully.`,
            })
            handleClose()

            await queryClient.invalidateQueries(trpc.skillGroups.all.queryFilter())
            await queryClient.invalidateQueries(trpc.skillGroups.byId.queryFilter({ skillGroupId }))
            await queryClient.invalidateQueries(trpc.skillGroups.bySkillPackageId.queryFilter({ skillPackageId: skillGroup.skillPackageId }))
        },
        
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit((data) => mutation.mutateAsync(data))}>
            <FormItem>
                <FormLabel>Package</FormLabel>
                <FormControl>
                    <FixedFormValue value={skillGroup.skillPackage.name}/>
                </FormControl>
            </FormItem>
             <FormField
                control={form.control}
                name="name"
                render={({ field }) => <FormItem>
                    <FormLabel>Skill Group Name</FormLabel>
                    <FormControl>
                        <Input {...field}/>
                    </FormControl>
                    <FormDescription>The name of the skill group.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => <FormItem>
                    <FormLabel>Skill Group Description</FormLabel>
                    <FormControl>
                        <Textarea {...field}/>
                    </FormControl>
                    <FormDescription>A description of what this skill group contains.</FormDescription>
                    <FormMessage/>
                </FormItem>}
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
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </Form>
    </FormProvider>
}
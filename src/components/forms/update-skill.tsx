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

import { DisplayValue, Form, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs, UpdateFormProps } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { useToast } from '@/hooks/use-toast'
import { SkillFormData, skillFormSchema } from '@/lib/forms/skill'
import { SkillWithPackageAndGroup, useTRPC } from '@/trpc/client'


export function UpdateSkillForm({ onClose, onUpdate, skillId }: UpdateFormProps<SkillWithPackageAndGroup> & { skillId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skill } = useSuspenseQuery(trpc.skills.byId.queryOptions({ skillId}))

    const form = useForm<SkillFormData>({
        resolver: zodResolver(skillFormSchema),
        defaultValues: {
            skillId, ...pick(skill, ['skillPackageId', 'skillGroupId', 'name', 'description', 'status', 'frequency', 'optional'])
        }
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skills.sys_update.mutationOptions({
        onError(error) {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillFormData, { message: error.shape.message })
            } else {
                 toast({
                    title: 'Error updating skill',
                    description: error.message,
                    variant: 'destructive'
                })
                handleClose()
            }
        },
        async onSuccess(result) {
            toast({
                title: 'Skill updated',
                description: `The skill "${result.name}" has been successfully updated.`
            })
            handleClose()
            onUpdate?.(result)

            await queryClient.invalidateQueries(trpc.skills.all.queryFilter())
            await queryClient.invalidateQueries(trpc.skills.byId.queryFilter({ skillId }))
            await queryClient.invalidateQueries(trpc.skills.bySkillGroupId.queryFilter({ skillGroupId: skill.skillGroupId }))
        },
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
            <FormItem>
                <FormLabel>Package</FormLabel>
                <FormControl>
                    <DisplayValue value={skill.skillPackage.name}/>
                </FormControl>
            </FormItem>
            <FormItem>
                <FormLabel>Group</FormLabel>
                <FormControl>
                    <DisplayValue value={skill.skillGroup.name}/>
                </FormControl>
            </FormItem>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                        <Input {...field}/>
                    </FormControl>
                    <FormDescription>The name of the skill.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => <FormItem>
                    <FormLabel>Skill Description</FormLabel>
                    <FormControl>
                        <Textarea {...field}/>
                    </FormControl>
                    <FormDescription>A description of what this skill entails.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                        <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select frequency"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="P3M">3 months</SelectItem>
                                <SelectItem value="P6M">6 months</SelectItem>
                                <SelectItem value="P1Y">12 months</SelectItem>
                                <SelectItem value="P2Y">24 months</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormDescription>How often this skill needs to be renewed.</FormDescription>
                    <FormMessage/>
                </FormItem>}
            />
            <FormField
                control={form.control}
                name="optional"
                render={({ field }) => <FormItem>
                    <div className="flex items-center gap-2">
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange}/>
                        </FormControl>
                        <FormLabel>Optional</FormLabel>
                    </div>
                    <FormDescription>Whether this skill is optional for team members.</FormDescription>
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
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { SkillPackageValue } from '@/components/controls/skill-package-value'
import { CreateFormProps, DisplayValue, Form, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { useToast } from '@/hooks/use-toast'
import { SkillFormData, skillFormSchema } from '@/lib/forms/skill'
import { nanoId8 } from '@/lib/id'
import { SkillWithPackageAndGroup, useTRPC } from '@/trpc/client'



export function CreateSkillForm({ onClose, onCreate, skillGroupId, skillPackageId }: CreateFormProps<SkillWithPackageAndGroup> & { skillGroupId?: string, skillPackageId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const { data: skillGroups } = useSuspenseQuery(trpc.skillGroups.bySkillPackageId.queryOptions({ skillPackageId }))

    const skillId = useMemo(() => nanoId8(), [])

    const form = useForm<SkillFormData>({
        resolver: zodResolver(skillFormSchema),
        defaultValues: {
            skillId,
            skillGroupId: skillGroupId ?? "",
            skillPackageId,
            name: '',
            description: '',
            frequency: 'P1Y', // Default to 1 year
            optional: false,
            status: 'Active'
        },
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skills.sys_create.mutationOptions({
        onError(error) {
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillFormData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error creating skill',
                    description: error.message,
                    variant: 'destructive',
                })
                handleClose()
            }
        },
        async onSuccess(result) {
            toast({
                title: 'Skill created',
                description: `The skill ${result.name} has been created successfully.`,
            })
            onCreate?.(result)
            handleClose()

            await queryClient.invalidateQueries(trpc.skills.all.queryFilter())
            await queryClient.invalidateQueries(trpc.skills.bySkillGroupId.queryFilter({ skillGroupId: result.skillGroupId }))
        }
    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
            <FormItem>
                <FormLabel>Skill Package</FormLabel>
                <FormControl>
                    <SkillPackageValue skillPackageId={skillPackageId}/>
                </FormControl>
            </FormItem>
            { skillGroupId
                ? <FormItem>
                    <FormLabel>Skill Group</FormLabel>
                    <FormControl>
                        <DisplayValue value={skillGroups.find(g => g.id == skillGroupId)!.name}/>
                    </FormControl>
                </FormItem>
                : <FormField
                    control={form.control}
                    name="skillGroupId"
                    render={({ field }) => <FormItem>
                        <FormLabel>Skill Group</FormLabel>
                        <FormControl>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a skill group"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {skillGroups.map(group => (
                                        <SelectItem key={group.id} value={group.id}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormDescription>Select the group this skill belongs to.</FormDescription>
                        <FormMessage/>
                    </FormItem>}
               />
            }
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
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.create}/>
                <FormCancelButton onClick={handleClose}/>
            </FormActions>
        </Form>
    </FormProvider>
}

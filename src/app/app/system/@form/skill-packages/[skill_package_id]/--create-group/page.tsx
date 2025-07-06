/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /app/system/@form/skill-packages/[skill_package_id]/--create-group
 */
'use client'

import { useRouter } from 'next/navigation'
import { use, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SkillPackageValue } from '@/components/controls/skill-package-value'
import { CreateFormProps, Form, FormActions, FormCancelButton, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSubmitButton, SubmitVerbs} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

import { useToast } from '@/hooks/use-toast'
import { SkillGroupFormData, skillGroupFormSchema } from '@/lib/forms/skill-group'
import { nanoId8 } from '@/lib/id'
import { SkillGroupWithPackage, useTRPC } from '@/trpc/client'




export default function CreateSkillGroupSheet({ params }: { params: Promise<{ skill_package_id: string }> }) {
    const { skill_package_id: skillPackageId } = use(params)

    const router = useRouter()

    return <Sheet open onOpenChange={open => { if(!open) router.back() }}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>New Skill Group</SheetTitle>
                    <SheetDescription>Create a new skill group in this package.</SheetDescription>
                </SheetHeader>
                <SheetBody>
                    <CreateSkillGroupForm
                        skillPackageId={skillPackageId}
                        onClose={() => router.back()} 
                    />
                </SheetBody>
            </SheetContent>
        </Sheet>
}

function CreateSkillGroupForm({ onClose, onCreate, skillPackageId }: CreateFormProps<SkillGroupWithPackage> & { skillPackageId: string }) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const trpc = useTRPC()

    const skillGroupId = useMemo(() => nanoId8(), [])

    const form = useForm<SkillGroupFormData>({
        resolver: zodResolver(skillGroupFormSchema),
        defaultValues: {
            skillGroupId,
            skillPackageId: skillPackageId ?? '',
            parentId: null,
            name: '',
            description: '',
            status: 'Active',
        },
    })

    function handleClose() {
        form.reset()
        onClose()
    }

    const mutation = useMutation(trpc.skillGroups.sys_create.mutationOptions({
        onError(error) {
        
            if(error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillGroupFormData, { message: error.shape.message })
            } else {
                toast({
                    title: 'Error creating skill group',
                    description: error.message,
                    variant: 'destructive',
                })
                handleClose()
            }
        },
        async onSuccess(skillGroup) {
            toast({
                title: 'Skill group created',
                description: `The skill group ${skillGroup.name} has been successfully created.`,
            })
            handleClose()
            onCreate?.(skillGroup)

            await queryClient.invalidateQueries(trpc.skillGroups.all.queryFilter())
            await queryClient.invalidateQueries(trpc.skillGroups.bySkillPackageId.queryFilter({ skillPackageId }))
        },

    }))

    return <FormProvider {...form}>
        <Form onSubmit={form.handleSubmit(formData => mutation.mutateAsync(formData))}>
            <FormItem>
                <FormLabel>Skill Package</FormLabel>
                <FormControl>
                    <SkillPackageValue skillPackageId={skillPackageId}/>
                </FormControl>
            </FormItem>
               
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Group Name</FormLabel>
                        <FormControl>
                            <Input {...field}/>
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
                        <FormLabel>Group Description</FormLabel>
                        <FormControl>
                            <Textarea {...field}/>
                        </FormControl>
                        <FormDescription>A description of the skill group.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormActions>
                <FormSubmitButton labels={SubmitVerbs.create}/>
                <FormCancelButton onClick={onClose}/>
            </FormActions>
        </Form>
    </FormProvider>
}
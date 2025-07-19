/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SkillPackageValue } from '@/components/controls/skill-package-value'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { SkillGroupFormData, skillGroupFormSchema } from '@/lib/forms/skill-group'
import { nanoId8 } from '@/lib/id'
import * as Paths from '@/paths'
import { useTRPC } from '@/trpc/client'

interface NewSkillGroupDetailsCardProps {
    skillPackageId: string
}

export function NewSkillGroupDetailsCard({ skillPackageId }: NewSkillGroupDetailsCardProps) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    const trpc = useTRPC()

    const skillGroupId = useMemo(() => nanoId8(), [])

    const form = useForm<SkillGroupFormData>({
        resolver: zodResolver(skillGroupFormSchema),
        defaultValues: {
            skillGroupId,
            skillPackageId,
            parentId: null,
            name: '',
            description: '',
            status: 'Active',
        }
    })

    const mutation = useMutation(trpc.skillGroups.sys_create.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillGroupFormData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error creating skill group",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess(result) {
            toast({
                title: "Skill Group Created",
                description: <>The skill group <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })

            queryClient.invalidateQueries(trpc.skillGroups.bySkillPackageId.queryFilter({ 
                skillPackageId,
                status: ['Active', 'Inactive']
            }))
            router.push(Paths.system.skillPackage(skillPackageId).group(result.id).index)
        }
    }))

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit(formData => mutation.mutate(formData))}>
                    <ToruGrid mode="form">
                        <FormField
                            control={form.control}
                            name="skillGroupId"
                            render={({ field }) => <ToruGridRow
                                label="Skill Group ID"
                                control={<DisplayValue>{field.value}</DisplayValue>}
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="skillPackageId"
                            render={({ field }) => <ToruGridRow
                                label="Skill Package"
                                control={<SkillPackageValue skillPackageId={field.value} />}
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => <ToruGridRow
                                label="Name"
                                control={<Input maxLength={100} {...field} />}
                                description="The name of the skill group."
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => <ToruGridRow
                                label="Description"
                                control={<Textarea maxLength={500} {...field} />}
                                description="A brief description of the skill group."
                            />}
                        />
                        <ToruGridRow
                            label="Status"
                            control={<DisplayValue>Active</DisplayValue>}
                        />
                        <ToruGridFooter>
                            <FormSubmitButton labels={SubmitVerbs.create} size="sm" />
                            <FormCancelButton onClick={() => router.back()} size="sm" />
                        </ToruGridFooter>
                    </ToruGrid>
                </Form>
            </FormProvider>
        </CardContent>
    </Card>
}

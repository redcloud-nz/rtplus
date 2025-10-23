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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillPackageData, skillPackageSchema } from '@/lib/schemas/skill-package'
import { nanoId8 } from '@/lib/id'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'




export function AdminModile_NewSkillPackage_Form({ organization }: { organization: OrganizationData }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    

    const skillPackageId = useMemo(() => nanoId8(), [])

    const form = useForm<SkillPackageData>({
        resolver: zodResolver(skillPackageSchema),
        defaultValues: {
            skillPackageId,
            name: '',
            description: '',
            status: 'Active',
        }
    })

    const mutation = useMutation(trpc.skills.createPackage.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillPackageData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error creating skill package",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess(result) {
            toast({
                title: "Skill Package Created",
                description: <>The skill package <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })

            queryClient.invalidateQueries(trpc.skills.getPackages.queryFilter())
            router.push(Paths.org(organization.slug).admin.skillPackage(result.skillPackageId).href)
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
                            name="skillPackageId"
                            render={({ field }) => <ToruGridRow
                                label="Skill Package ID"
                                control={<DisplayValue>{field.value}</DisplayValue>}
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => <ToruGridRow
                                label="Name"
                                control={<Input maxLength={100} {...field} />}
                                description="The name of the skill package."
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => <ToruGridRow
                                label="Description"
                                control={<Textarea maxLength={500} {...field} />}
                                description="A brief description of the skill package."
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
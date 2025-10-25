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
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { SkillPackageValue } from '@/components/controls/skill-package-value'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayValue } from '@/components/ui/display-value'
import { Form, FormCancelButton, FormField, FormSubmitButton, SubmitVerbs } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToruGrid, ToruGridFooter, ToruGridRow } from '@/components/ui/toru-grid'
import { ObjectName } from '@/components/ui/typography'

import { useToast } from '@/hooks/use-toast'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillData, skillSchema } from '@/lib/schemas/skill'
import { nanoId8 } from '@/lib/id'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function AdminModule_NewSkill_Form({ organization, skillPackageId }: { organization: OrganizationData, skillPackageId: string }) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { toast } = useToast()
    

    const skillId = useMemo(() => nanoId8(), [])

    // Get available skill groups for group selection
    const { data: skillGroups } = useSuspenseQuery(trpc.skills.getGroups.queryOptions({ orgId: organization.orgId, skillPackageId, status: ['Active', 'Inactive'] }))

    const form = useForm<SkillData>({
        resolver: zodResolver(skillSchema),
        defaultValues: {
            skillId,
            skillPackageId,
            skillGroupId: '',
            name: '',
            description: '',
            status: 'Active',
        }
    })

    const mutation = useMutation(trpc.skills.createSkill.mutationOptions({
        onError(error) {
            if (error.shape?.cause?.name == 'FieldConflictError') {
                form.setError(error.shape.cause.message as keyof SkillData, { message: error.shape.message })
            } else {
                toast({
                    title: "Error creating skill",
                    description: error.message,
                    variant: 'destructive',
                })
            }
        },
        onSuccess(result) {
            toast({
                title: "Skill Created",
                description: <>The skill <ObjectName>{result.name}</ObjectName> has been created successfully.</>,
            })

            queryClient.invalidateQueries(trpc.skills.getSkills.queryFilter({ skillPackageId }))
            queryClient.invalidateQueries(trpc.skills.getSkills.queryFilter({ skillGroupId: result.skillGroupId }))

            router.push(Paths.org(organization.slug).admin.skillPackage(skillPackageId).skill(result.skillId).href)
        }
    }))

    return <Card>
        <CardHeader>
            <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <Form onSubmit={form.handleSubmit(formData => mutation.mutate({ ...formData, orgId: organization.orgId }))}>
                    <ToruGrid mode="form">
                        <FormField
                            control={form.control}
                            name="skillId"
                            render={({ field }) => <ToruGridRow
                                label="Skill ID"
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
                            name="skillGroupId"
                            render={({ field }) => <ToruGridRow
                                label="Skill Group"
                                control={
                                    <Select 
                                        value={field.value} 
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select skill group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {skillGroups.map(group => (
                                                <SelectItem key={group.skillGroupId} value={group.skillGroupId}>
                                                    {group.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                }
                                description="The skill group this skill belongs to."
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => <ToruGridRow
                                label="Name"
                                control={<Input maxLength={100} {...field} />}
                                description="The name of the skill."
                            />}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => <ToruGridRow
                                label="Description"
                                control={<Textarea maxLength={500} {...field} />}
                                description="A brief description of the skill."
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

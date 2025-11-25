/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { ComponentProps, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { pick } from 'remeda'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Input } from '@/components/ui/s2-input'
import { Link } from '@/components/ui/link'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { S2_Textarea } from '../ui/s2-textarea'
import { S2_Value } from '@/components/ui/s2-value'

import { SkillGroupData, skillGroupSchema } from '@/lib/schemas/skill-group'
import { OrganizationData } from '@/lib/schemas/organization'
import * as Paths from '@/paths'




type SKillGroupFormProps = Omit<ComponentProps<'form'>, 'children' | 'onSubmit'> & {
    mode: 'Create' | 'Update',
    organization: OrganizationData
    skillGroup: SkillGroupData
    onSubmit: (data: SkillGroupData) => Promise<void>
}

export function SkillGroupForm({ mode, organization, onSubmit, skillGroup, ...props }: SKillGroupFormProps) {

    const [isPending, setIsPending] = useState(false)

    const form = useForm({
        resolver: zodResolver(skillGroupSchema.pick({ name: true, description: true, status: true })),
        defaultValues: pick(skillGroup, ['name', 'description', 'status'])
    })

    const handleSubmit = form.handleSubmit(async (data) => {
        setIsPending(true)
        await onSubmit({ ...skillGroup, ...data})
        setIsPending(false)
        form.reset()
    })
    
     return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>{mode == 'Create' ? 'Create Skill Group' : 'Update Skill Group'}</S2_CardTitle>
        </S2_CardHeader>
        <S2_CardContent>
            <form id="skill-group-form" onSubmit={handleSubmit} {...props}>
                <FieldGroup>
                    <Field orientation="responsive">
                         <FieldLabel>Skill Group ID</FieldLabel>
                        <S2_Value value={skillGroup.skillGroupId}/>
                    </Field>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="skill-group-name">Name</FieldLabel>
                                <S2_Input
                                    aria-invalid={fieldState.invalid}
                                    id="skill-group-name"
                                    maxLength={100}
                                    {...field}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                            </Field>
                        )}
                    />
                    <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="skill-group-description">Description</FieldLabel>
                                <S2_Textarea
                                    aria-invalid={fieldState.invalid}
                                    id="skill-group-description"
                                    maxLength={500}
                                    {...field}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                            </Field>
                        }
                    />
                    <Controller
                        name="status"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field 
                                data-invalid={fieldState.invalid}
                                orientation="responsive"
                            >
                                <FieldLabel htmlFor="skill-group-status">Status</FieldLabel>
                                <S2_Select value={field.value} onValueChange={field.onChange}>
                                    <S2_SelectTrigger id="skill-group-status" className="min-w-32" aria-invalid={fieldState.invalid}>
                                        <S2_SelectValue placeholder="Select status" />
                                    </S2_SelectTrigger>
                                    <S2_SelectContent>
                                        <S2_SelectItem value="Active">Active</S2_SelectItem>
                                        <S2_SelectItem value="Inactive">Inactive</S2_SelectItem>
                                    </S2_SelectContent>
                                </S2_Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                            </Field>
                        }
                    />
                    <Field orientation="horizontal">
                        <S2_Button 
                            type="submit"
                            disabled={!form.formState.isDirty || isPending}
                            form="skill-group-form"
                        >
                            {mode === 'Create' ? 'Create' : 'Save'}
                        </S2_Button>
                        <S2_Button 
                            type="button"
                            variant="outline" 
                            disabled={isPending} 
                            onClick={() => form.reset() } 
                            asChild
                        >
                            <Link to={mode === 'Create' 
                                ? Paths.org(organization.slug).skillPackageManager.skillPackage(skillGroup.skillPackageId) 
                                : Paths.org(organization.slug).skillPackageManager.skillPackage(skillGroup.skillPackageId).group(skillGroup.skillGroupId)
                            }>
                                Cancel
                            </Link>
                        </S2_Button>
                    </Field>
            </FieldGroup>
          </form>
        </S2_CardContent>
    </S2_Card>
}
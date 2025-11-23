/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

'use client'

import { ComponentProps, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { S2_Button } from '@/components/ui/s2-button'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Input } from '@/components/ui/s2-input'
import { Link } from '@/components/ui/link'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'
import { S2_Value } from '@/components/ui/s2-value'

import { SkillPackageData } from '@/lib/schemas/skill-package'
import { OrganizationData } from '@/lib/schemas/organization'
import * as Paths from '@/paths'
import { S2_Textarea } from '../ui/s2-textarea'



type SkillPackageFormProps = Omit<ComponentProps<'form'>, 'children' | 'onSubmit'> & {
    form: ReturnType<typeof useForm<SkillPackageData>>
    mode: 'Create' | 'Update'
    organization: OrganizationData
    onSubmit: (data: SkillPackageData) => Promise<void>
    skillPackageId: string
}

export function SkillPackageForm({ form, mode, organization, onSubmit, skillPackageId, ...props }: SkillPackageFormProps) {

    const [isPending, setIsPending] = useState(false)

    const handleSubmit = form.handleSubmit(async (data) => {
        setIsPending(true)
        await onSubmit(data)
        setIsPending(false)
        form.reset()
    })
    
     return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>{mode == 'Create' ? 'Create Skill Package' : 'Update Skill Package'}</S2_CardTitle>
        </S2_CardHeader>
        <S2_CardContent>
            <form id="skill-package-form" onSubmit={handleSubmit} {...props}>
                <FieldGroup>
                    <Field orientation="responsive">
                        <FieldContent>
                            <FieldLabel>Skill Package ID</FieldLabel>
                        </FieldContent>
                        <S2_Value value={skillPackageId} className="min-w-1/2"/>
                    </Field>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field 
                                data-invalid={fieldState.invalid}
                                orientation="responsive"
                            >
                                <FieldContent>
                                    <FieldLabel htmlFor="skill-package-name">Skill Package Name</FieldLabel>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Input
                                    aria-invalid={fieldState.invalid}
                                    id="skill-package-name"
                                    className="min-w-1/2"
                                    maxLength={100}
                                    {...field}
                                />
                            </Field>
                        }
                    />
                    <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field 
                                data-invalid={fieldState.invalid}
                                orientation="responsive"
                                >
                                <FieldContent>
                                    <FieldLabel htmlFor="skill-package-description">Description</FieldLabel>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Textarea
                                    aria-invalid={fieldState.invalid}
                                    id="skill-package-description"
                                    className="min-w-1/2"
                                    maxLength={500}
                                    {...field}
                                />
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
                                <FieldContent>
                                    <FieldLabel htmlFor="skill-package-status">Status</FieldLabel>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Select value={field.value} onValueChange={field.onChange}>
                                    <S2_SelectTrigger id="skill-package-status" className="min-w-1/2" aria-invalid={fieldState.invalid}>
                                        <S2_SelectValue placeholder="Select status" />
                                    </S2_SelectTrigger>
                                    <S2_SelectContent>
                                        <S2_SelectItem value="Active">Active</S2_SelectItem>
                                        <S2_SelectItem value="Inactive">Inactive</S2_SelectItem>
                                    </S2_SelectContent>
                                </S2_Select>
                            </Field>
                        }
                    />
                    <Field orientation="horizontal">
                        <S2_Button 
                            type="submit"
                            disabled={!form.formState.isDirty || isPending}
                            form="skill-package-form"
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
                            <Link to={mode === 'Create' ? Paths.org(organization.slug).skillPackageManager.skillPackages : Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackageId)}>
                                Cancel
                            </Link>
                        </S2_Button>
                    </Field>
                </FieldGroup>
            </form>
        </S2_CardContent>
    </S2_Card>
}
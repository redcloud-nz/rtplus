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

import { OrganizationData } from '@/lib/schemas/organization'
import { PersonData, PersonId} from '@/lib/schemas/person'
import * as Paths from '@/paths'



type PersonFormProps = Omit<ComponentProps<'form'>, 'children' | 'onSubmit'> & {
    form: ReturnType<typeof useForm<PersonData>>
    mode: 'Create' | 'Update'
    organization: OrganizationData
    onSubmit: (data: PersonData) => Promise<void>
    personId: PersonId
    
}

export function PersonForm({ form, mode, organization, onSubmit, personId, ...props }: PersonFormProps) {

    const [isPending, setIsPending] = useState(false)

    const handleSubmit = form.handleSubmit(async (data) => {
        setIsPending(true)
        await onSubmit(data)
        form.reset(data)
        setIsPending(false)
    })
    
    return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>{mode == 'Create' ? 'Create Person' : 'Update Person'}</S2_CardTitle>
        </S2_CardHeader>
        <S2_CardContent>
            <form id="person-form" onSubmit={handleSubmit} {...props}>
                <FieldGroup>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field 
                                data-invalid={fieldState.invalid}
                                orientation="responsive"
                                >
                                <FieldContent>
                                    <FieldLabel htmlFor="person-name">Name</FieldLabel>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Input
                                    aria-invalid={fieldState.invalid}
                                    id="person-name"
                                    className="min-w-1/2"
                                    maxLength={100}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </Field>
                        }
                    />
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => 
                            <Field 
                                data-invalid={fieldState.invalid}
                                orientation="responsive"
                                >
                                <FieldContent>
                                    <FieldLabel htmlFor="person-email">Email</FieldLabel>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Input
                                    aria-invalid={fieldState.invalid}
                                    id="person-email"
                                    type="email"
                                    className="min-w-1/2"
                                    maxLength={100}
                                    value={field.value}
                                    onChange={field.onChange}
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
                                    <FieldLabel htmlFor="person-status">Status</FieldLabel>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                </FieldContent>
                                <S2_Select value={field.value} onValueChange={field.onChange}>
                                    <S2_SelectTrigger id="person-status" className="min-w-1/2" aria-invalid={fieldState.invalid}>
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
                            form="person-form"
                        >
                            {mode === 'Create' ? 'Create' : 'Save'}
                        </S2_Button>
                        <S2_Button 
                            type="button"
                            variant="outline" 
                            disabled={isPending} onClick={() => form.reset() } 
                            asChild
                        >
                            <Link to={mode === 'Create' ? Paths.org(organization.slug).admin.personnel : Paths.org(organization.slug).admin.person(personId)}>
                                Cancel
                            </Link>
                        </S2_Button>
                    </Field>
                </FieldGroup>
            </form>
        </S2_CardContent>
    </S2_Card>
}
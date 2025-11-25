/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Select, S2_SelectContent, S2_SelectItem, S2_SelectTrigger, S2_SelectValue } from '@/components/ui/s2-select'

import { organizationSettingsSchema } from '@/lib/schemas/settings'




export function Settings_DefaultValues_Card({ form }: { form: ReturnType<typeof useForm<z.input<typeof organizationSettingsSchema>>> }) {
    
    return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>Default Values</S2_CardTitle>
        </S2_CardHeader>
        <S2_CardContent>
            <FieldGroup>
                <Controller
                    name="defaultPageSize"
                    control={form.control}
                    render={({ field, fieldState }) => <Field
                        data-invalid={fieldState.invalid}
                        orientation="responsive"
                    >
                        <FieldContent>
                            <FieldLabel htmlFor="defaultPageSize-select">Default Page Size</FieldLabel>
                            <FieldDescription>The default number of rows to display when paginating lists.</FieldDescription>
                            { fieldState.error && <FieldError errors={[fieldState.error]}/>}
                        </FieldContent>
                        
                        <S2_Select                
                            value={field.value?.toString() ?? ''}
                            onValueChange={value => {
                                field.onChange(Number(value))
                            }}
                        >
                            <S2_SelectTrigger 
                                id="defaultPageSize-select"
                                className="min-w-24"
                                aria-invalid={fieldState.invalid}
                            >
                                <S2_SelectValue />
                            </S2_SelectTrigger>
                            <S2_SelectContent>
                                {[10, 20, 50, 100, 200, 500].map(size => 
                                    <S2_SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </S2_SelectItem>
                                )}
                            </S2_SelectContent>
                        </S2_Select>
                    </Field>}
                />
            </FieldGroup>
        </S2_CardContent>
    </S2_Card>
}
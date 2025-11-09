/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */
'use client'

import { Controller, useForm } from 'react-hook-form'

import { S2_Card, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'

import { OrganizationSettingsData } from '@/lib/schemas/settings'

/**
 * Card controlling which modules are enabled for the organization.
 */
export function Settings_EnabledModules_Card({ form }: { form: ReturnType<typeof useForm<OrganizationSettingsData>> }) {

    return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>Enabled Modules</S2_CardTitle>
            <S2_CardDescription>Manage which modules are enabled for your organization.</S2_CardDescription>
        </S2_CardHeader>
        <S2_CardContent>
            <FieldGroup>
                <Controller
                    name="modules.d4hViews.enabled"
                    control={form.control}
                    render={({ field, fieldState }) => <Field orientation="horizontal">
                        <FieldContent>
                            <FieldLabel htmlFor="d4h-module-enabled">D4H Views</FieldLabel>
                        </FieldContent>
                        <Switch
                            id="d4h-module-enabled"
                            name={field.name}
                            aria-invalid={fieldState.invalid}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </Field>
                }/>
                <Controller
                    name="modules.notes.enabled"
                    control={form.control}
                    render={({ field, fieldState }) => <Field orientation="horizontal">
                        <FieldContent>
                            <FieldLabel htmlFor="notes-module-enabled">Notes</FieldLabel>
                        </FieldContent>
                        <Switch
                            id="notes-module-enabled"
                            name={field.name}
                            aria-invalid={fieldState.invalid}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </Field>
                }/>
                <Controller
                    name="modules.skills.enabled"
                    control={form.control}
                    render={({ field, fieldState }) => <Field orientation="horizontal">
                        <FieldContent>
                            <FieldLabel htmlFor="skills-module-enabled">Skills</FieldLabel>
                        </FieldContent>
                        <Switch
                            id="skills-module-enabled"
                            name={field.name}
                            aria-invalid={fieldState.invalid}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </Field>
                }/>
                <Controller
                    name="modules.skillPackageManager.enabled"
                    control={form.control}
                    render={({ field, fieldState }) => <Field orientation="horizontal">
                        <FieldContent>
                            <FieldLabel htmlFor="spm-module-enabled">Skill Package Manager</FieldLabel>
                        </FieldContent>
                        <Switch
                            id="spm-module-enabled"
                            name={field.name}
                            aria-invalid={fieldState.invalid}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </Field>
                }/>
            </FieldGroup>
        </S2_CardContent>
    </S2_Card>
}
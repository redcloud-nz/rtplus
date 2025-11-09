/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { Controller, useForm, useWatch } from 'react-hook-form'

import { S2_Card, S2_CardContent, S2_CardDescription, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import { D4hServerList } from '@/lib/d4h-api/servers'
import { OrganizationSettingsData } from '@/lib/schemas/settings'


/**
 * Card containing the organization level settings for the D4H integration.
 */
export function Settings_D4hIntegration_Card({ form }: { form: ReturnType<typeof useForm<OrganizationSettingsData>> }) {

    const enabled = useWatch({ control: form.control, name: 'integrations.d4h.enabled' })

    return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>D4H Integration</S2_CardTitle>
            <S2_CardDescription>Configure the integration with D4H for this organization.</S2_CardDescription>
        </S2_CardHeader>
        <S2_CardContent>
            <FieldGroup>
                <Controller
                    name="integrations.d4h.enabled"
                    control={form.control}
                    render={({ field, fieldState }) => <Field orientation="horizontal">
                        <FieldContent>
                            <FieldLabel htmlFor="d4h-integration-enabled">Enable D4H Integration</FieldLabel>
                        </FieldContent>
                        <Switch
                            id="d4h-integration-enabled"
                            name={field.name}
                            aria-invalid={fieldState.invalid}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </Field>
                }/>
                
            <Controller 
                name="integrations.d4h.server" 
                control={form.control}
                render={({ field, fieldState }) => <Field orientation="responsive">
                    <FieldContent>
                        <FieldLabel>D4H Server</FieldLabel>
                        <FieldDescription>The D4H server that your organisation uses.</FieldDescription>
                    </FieldContent>
                    
                    <Select
                        name={field.name}
                        aria-invalid={fieldState.invalid}
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!enabled}
                    >
                        <SelectTrigger className="max-w-80">
                            <SelectValue placeholder="Select server" />
                        </SelectTrigger>
                        <SelectContent>
                            {D4hServerList.map((server) => (
                                <SelectItem key={server.code} value={server.code}>{server.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            }/>
        </FieldGroup>
        </S2_CardContent>
    </S2_Card>
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { useForm } from 'react-hook-form'

import { Card2, Card2Content, Card2Description, Card2Header, Card2Title } from '@/components/ui/card2'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UnderConstruction } from '@/components/ui/under-construction'

import { D4hServerList } from '@/lib/d4h-api/servers'
import { OrganizationSettingsData } from '@/lib/schemas/settings'




export function D4HModuleSettingsForm({}: { form: ReturnType<typeof useForm<OrganizationSettingsData>> }) {

    return <Card2>
        <Card2Header>
            <Card2Title>D4H Module</Card2Title>
            <Card2Description>Configure the D4H integration settings for your organization.</Card2Description>
        </Card2Header>
        <Card2Content>
            <FieldGroup>
                <Field>
                    <FieldLabel>Server</FieldLabel>
                    <FieldDescription>The D4H server that your organisation uses.</FieldDescription>
                    <Select>
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
            </FieldGroup>
        </Card2Content>
        <UnderConstruction/>
    </Card2>
}

/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

'use client'
import { useSuspenseQuery } from '@tanstack/react-query'

import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Value } from '@/components/ui/s2-value'

import { OrganizationData } from '@/lib/schemas/organization'
import { PersonId } from '@/lib/schemas/person'
import { trpc } from '@/trpc/client'


export function AdminModule_PersonDetails({ organization, personId }: { organization: OrganizationData, personId: PersonId }) {

    const { data: person } = useSuspenseQuery(trpc.personnel.getPerson.queryOptions({ orgId: organization.orgId, personId }))

    return  <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>Person Details</S2_CardTitle>
        </S2_CardHeader>
        <S2_CardContent>
            <FieldGroup>
                <Field orientation="responsive">
                    <FieldLabel>Person ID</FieldLabel>
                    <S2_Value value={person.personId} className="min-w-1/2"/>
                </Field>
                <Field orientation="responsive">
                    <FieldLabel>Name</FieldLabel>
                    <S2_Value value={person.name} className="min-w-1/2"/>
                </Field>
                <Field orientation="responsive">
                    <FieldLabel>Email</FieldLabel>
                    <S2_Value value={person.email} className="min-w-1/2"/>
                </Field>
                <Field orientation="responsive">
                    <FieldLabel>Linked User ID</FieldLabel>
                    <S2_Value value={person.userId ?? 'Not linked'} className="min-w-1/2"/>
                </Field>
                <Field orientation="responsive">
                    <FieldLabel>Status</FieldLabel>
                    <S2_Value value={person.status} className="min-w-1/2"/>
                </Field>
            </FieldGroup>
        </S2_CardContent>
    </S2_Card>
}
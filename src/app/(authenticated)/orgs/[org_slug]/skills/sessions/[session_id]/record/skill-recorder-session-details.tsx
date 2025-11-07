/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { S2_Value } from '@/components/ui/s2-value'

import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { formatDate } from '@/lib/utils'


export function SkillRecorder_Session_Details({ organization, session }: { organization: OrganizationData, session: SkillCheckSessionData }) {
    
    return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>Session Details</S2_CardTitle>
        </S2_CardHeader>
        <S2_CardContent>
            <FieldGroup>
                <Field orientation='responsive'>
                    <FieldLabel>SesionId</FieldLabel>
                    <S2_Value value={session.sessionId} className="min-w-1/2"/>
                </Field>
                <Field orientation='responsive'>
                    <FieldLabel>Name</FieldLabel>
                    <S2_Value value={session.name} className="min-w-1/2"/>
                </Field>
                <Field orientation='responsive'>
                    <FieldLabel>Date</FieldLabel>
                    <S2_Value value={formatDate(session.date)} className="min-w-1/2"/>
                </Field>
                <Field orientation='responsive'>
                    <FieldLabel>Status</FieldLabel>
                    <S2_Value value={session.sessionStatus} className="min-w-1/2"/>
                </Field>
            </FieldGroup>
        </S2_CardContent>
    </S2_Card>
}
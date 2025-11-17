
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

'use client'
import { useSuspenseQuery } from '@tanstack/react-query'

import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field'
import { S2_Value } from '@/components/ui/s2-value'

import { OrganizationData } from '@/lib/schemas/organization'
import { TeamId } from '@/lib/schemas/team'
import { trpc } from '@/trpc/client'



export function AdminModule_TeamDetails({ organization, teamId }: { organization: OrganizationData, teamId: TeamId }) {

    const { data: team } = useSuspenseQuery(trpc.teams.getTeam.queryOptions({ orgId: organization.orgId, teamId }))

    return  <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>Team Details</S2_CardTitle>
        </S2_CardHeader>
        <S2_CardContent>
            <FieldGroup>
                <Field orientation="responsive">
                    <FieldContent>
                         <FieldLabel>Team ID</FieldLabel>
                    </FieldContent>
                    <S2_Value value={team.teamId} className="min-w-1/2"/>
                </Field>
                <Field orientation="responsive">
                    <FieldContent>
                        <FieldLabel>Name</FieldLabel>
                    </FieldContent>
                    <S2_Value value={team.name} className="min-w-1/2"/>
                </Field>
                
                <Field orientation="responsive">
                    <FieldContent>
                        <FieldLabel>Status</FieldLabel>
                    </FieldContent>
                    <S2_Value value={team.status} className="min-w-1/2"/>
                </Field>
            </FieldGroup>
        </S2_CardContent>
    </S2_Card>
}
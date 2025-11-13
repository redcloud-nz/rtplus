/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useQuery } from '@tanstack/react-query'

import { StatItem, StatItemDescription, StatItemTitle, StatItemValue } from '@/components/ui/stat-item'
import { OrganizationData } from '@/lib/schemas/organization'
import { SkillCheckSessionId } from '@/lib/schemas/skill-check-session'
import { trpc } from '@/trpc/client'



export function AssignedAssesseesCount_Card({ organization, sessionId }: { organization: OrganizationData, sessionId: SkillCheckSessionId }) {

    const { isLoading, data } = useQuery(trpc.skillChecks.getSessionStats.queryOptions({ orgId: organization.orgId, sessionId }))

    return <StatItem>
        <StatItemValue loading={isLoading}>{data?.assignedAssesseesCount}</StatItemValue>
        <StatItemTitle>Assessees</StatItemTitle>
        <StatItemDescription>assigned to this session</StatItemDescription>
    </StatItem>
}

export function AssignedSkillsCount_Card({ organization, sessionId }: { organization: OrganizationData, sessionId: SkillCheckSessionId }) {

    const { isLoading, data } = useQuery(trpc.skillChecks.getSessionStats.queryOptions({ orgId: organization.orgId, sessionId }))

    return <StatItem>
        <StatItemValue loading={isLoading}>{data?.assignedSkillsCount}</StatItemValue>
        <StatItemTitle>Skills</StatItemTitle>
        <StatItemDescription>assigned to this session</StatItemDescription>
    </StatItem>
}

export function RecordedChecksCount_Card({ organization, sessionId }: { organization: OrganizationData, sessionId: SkillCheckSessionId }) {

    const { isLoading, data } = useQuery(trpc.skillChecks.getSessionStats.queryOptions({ orgId: organization.orgId, sessionId }))

    return <StatItem>
        <StatItemValue loading={isLoading}>{data?.recordedChecksCount}</StatItemValue>
        <StatItemTitle>Checks</StatItemTitle>
        <StatItemDescription>recorded in this session</StatItemDescription>
    </StatItem>
}

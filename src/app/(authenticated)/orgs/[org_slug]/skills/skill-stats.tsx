/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useQuery } from '@tanstack/react-query'

import { Link } from '@/components/ui/link'
import { StatItem, StatItemDescription, StatItemTitle, StatItemValue } from '@/components/ui/stat-item'

import { OrganizationData } from '@/lib/schemas/organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function SkillsCount_Card({ organization }: { organization: OrganizationData }) {

    const { isLoading, data: skillPackages = [] } = useQuery(trpc.skills.getAvailablePackages.queryOptions({ orgId: organization.orgId }))
    const skills = skillPackages.flatMap(pkg => pkg.skills)

    return <StatItem asChild>
        <Link to={Paths.org(organization.orgId).skills.catalogue}>
            <StatItemValue loading={isLoading}>{skills.length}</StatItemValue>
            <StatItemTitle>Skills</StatItemTitle>
            <StatItemDescription>that can be checked</StatItemDescription>
        </Link>
    </StatItem>

}

export function PersonnelCount_Card({ organization }: { organization: OrganizationData }) {

    const { isLoading, data: personnel = [] } = useQuery(trpc.personnel.getPersonnel.queryOptions({ orgId: organization.orgId }))

    return <StatItem asChild>
        <Link to={Paths.org(organization.orgId).admin.personnel}>
            <StatItemValue loading={isLoading}>{personnel.length}</StatItemValue>
            <StatItemTitle>Personnel</StatItemTitle>
            <StatItemDescription>that can be assessed</StatItemDescription>
        </Link>
    </StatItem>
}

export function SessionsCount_Card({ organization }: { organization: OrganizationData }) {

    const { isLoading, data: sessions = [] } = useQuery(trpc.skillChecks.getSessions.queryOptions({ orgId: organization.orgId }))

    return <StatItem asChild>
        <Link to={Paths.org(organization.orgId).skills.sessions}>
            <StatItemValue loading={isLoading}>{sessions.length}</StatItemValue>
            <StatItemTitle>Sessions</StatItemTitle>
            <StatItemDescription>that have been created</StatItemDescription>
        </Link>
    </StatItem>
}


export function SkillChecksCount_Card({ organization }: { organization: OrganizationData }) {

    const { isLoading, data: skillChecks = [] } = useQuery(trpc.skillChecks.getSkillChecks.queryOptions({ orgId: organization.orgId }))

    return <StatItem asChild>
        <Link to={Paths.org(organization.orgId).skills.checks}>
            <StatItemValue loading={isLoading}>{skillChecks.length}</StatItemValue>
            <StatItemTitle>Skill Checks</StatItemTitle>
            <StatItemDescription>have been completed</StatItemDescription>
        </Link>
    </StatItem>
}
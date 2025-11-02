/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Link } from '@/components/ui/link'
import { StatItem, StatItemDescription, StatItemTitle, StatItemValue } from '@/components/ui/stat-item'

import { OrganizationData } from '@/lib/schemas/organization'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



export function SkillsCount_Card({ organization }: { organization: OrganizationData }) {

    const { data: skillPackages } = useSuspenseQuery(trpc.skills.getAvailablePackages.queryOptions({ orgId: organization.orgId }))
    const skills = skillPackages.flatMap(pkg => pkg.skills)

    return <StatItem asChild>
        <Link to={Paths.org(organization.orgId).skills.catalogue}>
            <StatItemValue>{skills.length}</StatItemValue>
            <StatItemTitle>Skills</StatItemTitle>
            <StatItemDescription>that can be checked</StatItemDescription>
        </Link>
    </StatItem>

}

export function PersonnelCount_Card({ organization }: { organization: OrganizationData }) {

    const { data: personnel } = useSuspenseQuery(trpc.personnel.getPersonnel.queryOptions({ orgId: organization.orgId }))

    return <StatItem asChild>
        <Link to={Paths.org(organization.orgId).admin.personnel}>
            <StatItemValue>{personnel.length}</StatItemValue>
            <StatItemTitle>Team Members</StatItemTitle>
            <StatItemDescription>that can be assessed</StatItemDescription>
        </Link>
    </StatItem>
}

export function SessionsCount_Card({ organization }: { organization: OrganizationData }) {

    const { data: sessions } = useSuspenseQuery(trpc.skillChecks.getSessions.queryOptions({ orgId: organization.orgId }))

    return <StatItem asChild>
        <Link to={Paths.org(organization.orgId).skills.sessions}>
            <StatItemValue>{sessions.length}</StatItemValue>
            <StatItemTitle>Sessions</StatItemTitle>
            <StatItemDescription>that have been created</StatItemDescription>
        </Link>
    </StatItem>
}


export function SkillChecksCount_Card({ organization }: { organization: OrganizationData }) {

    const { data: skillChecks } = useSuspenseQuery(trpc.skillChecks.getSkillChecks.queryOptions({ orgId: organization.orgId }))

    return <StatItem asChild>
        <Link to={Paths.org(organization.orgId).skills.checks}>
            <StatItemValue>{skillChecks.length}</StatItemValue>
            <StatItemTitle>Skill Checks</StatItemTitle>
            <StatItemDescription>have been completed</StatItemDescription>
        </Link>
    </StatItem>
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import { TeamData } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import { trpc } from '@/trpc/client'



interface StatProps {
    objectType: string
    value: number
    description: string
    linksTo: { href: string }
}

function Stat({ objectType: title, value, description, linksTo }: StatProps) {
    return <Button className="h-30 flex flex-col items-center justify-center gap-1 py-2" variant="outline" asChild>
        <Link to={linksTo}>
            <div className="text-4xl font-bold">{value}</div>
            <div className="">{title}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
        </Link>
    </Button>
}

export function SkillsCount_Card({ team }: { team: TeamData }) {

    const { data: skillPackages } = useSuspenseQuery(trpc.skills.getAvailablePackages.queryOptions({ teamId: team.teamId }))
    const skills = skillPackages.flatMap(pkg => pkg.skills)

    return <Stat objectType="Skills" value={skills.length} description="Skills that can be checked" linksTo={Paths.org(team).skills.catalogue}/>
}

export function TeamMembersCount_Card({ team }: { team: TeamData }) {

    const { data: teamMembers } = useSuspenseQuery(trpc.teamMemberships.getTeamMemberships.queryOptions({ teamId: team.teamId }))

    return <Stat objectType="Team Members" value={teamMembers.length} description="that can be assessed"  linksTo={Paths.org(team).members}/>
}

export function SessionsCount_Card({ team }: { team: TeamData }) {

    const { data: sessions } = useSuspenseQuery(trpc.skillChecks.getSessions.queryOptions({ teamId: team.teamId }))

    return <Stat objectType="Sessions" value={sessions.length} description="have been created"  linksTo={Paths.org(team).skills.sessions}/>
}


export function SkillChecksCount_Card({ team }: { team: TeamData }) {

    const { data: skillChecks } = useSuspenseQuery(trpc.skillChecks.getSkillChecks.queryOptions({ teamId: team.teamId }))

    return <Stat objectType="Skill Checks" value={skillChecks.length} description="have been completed" linksTo={Paths.org(team).skills.checks} />
}
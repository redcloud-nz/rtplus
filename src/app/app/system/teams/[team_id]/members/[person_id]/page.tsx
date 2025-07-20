/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/teams/[team_id]/members/[person_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { SystemTeamMembershipDetailsCard } from '@/components/cards/system-team-membership-details'

import * as Paths from '@/paths'
import { fetchTeamMembership } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'




export async function generateMetadata(props: { params: Promise<{ person_id: string, team_id: string }> }) {
    const { person, team } = await fetchTeamMembership(props.params)
    return { title: `${person.name} - ${team.shortName || team.name}` }
}

export default async function TeamMemberPage(props: { params: Promise<{ person_id: string, team_id: string }>} ) {
    const { person, team } = await fetchTeamMembership(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system,
                Paths.system.teams,
                { label: team.shortName || team.name, href: Paths.system.team(team.teamId).index },
                "Members",
                person.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Team Member">{person.name}</PageTitle>
            </PageHeader>
            <HydrateClient>
                <Boundary>
                    <SystemTeamMembershipDetailsCard 
                        context='team'
                        personId={person.personId}
                        teamId={team.teamId}
                    />
                </Boundary>
            </HydrateClient>
        </AppPageContent>
    </AppPage>
}
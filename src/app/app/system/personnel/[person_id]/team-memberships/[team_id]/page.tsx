/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/personnel/[person_id]/team-memberships/[team_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { SystemTeamMembershipDetailsCard } from '@/components/cards/system-team-membership-details'

import * as Paths from '@/paths'
import { HydrateClient } from '@/trpc/server'

import { getTeamMembership, TeamMembershipParams } from '.'



export async function generateMetadata(props: { params: Promise<TeamMembershipParams> }) {

    const membership = await getTeamMembership(props.params)

    return { title: `${membership.person.name} - ${membership.team.shortName || membership.team.name}` }
}

export default async function TeamMembershipPage(props: { params: Promise<TeamMembershipParams>} ) {
    const { person, team } = await getTeamMembership(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system,
                Paths.system.personnel,
                { label: person.name, href: Paths.system.person(person.id).index },
                "Team Memberships",
                team.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Team Membership">{team.name}</PageTitle>
            </PageHeader>
            <HydrateClient>
                <Boundary>
                    <SystemTeamMembershipDetailsCard 
                        context='person'
                        personId={person.id}
                        teamId={team.id}
                    />
                </Boundary>
            </HydrateClient>
        </AppPageContent>
    </AppPage>
}
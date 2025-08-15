/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/personnel/[person_id]/team-memberships/[team_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { System_TeamMembership_Details_Card } from '@/components/cards/system-team-membership-details'

import * as Paths from '@/paths'
import { fetchTeamMembership } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'




export async function generateMetadata(props: { params: Promise<{ person_id: string, team_id: string }> }) {

    const membership = await fetchTeamMembership(props.params)

    return { title: `${membership.person.name} - ${membership.team.shortName || membership.team.name}` }
}

export default async function System_Person_TeamMembership_Page(props: { params: Promise<{ person_id: string, team_id: string }>} ) {
    const { person, team } = await fetchTeamMembership(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system,
                Paths.system.personnel,
                { label: person.name, href: Paths.system.person(person.personId).href },
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
                    <System_TeamMembership_Details_Card 
                        context='person'
                        personId={person.personId}
                        teamId={team.teamId}
                    />
                </Boundary>
            </HydrateClient>
        </AppPageContent>
    </AppPage>
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/teams/[team_id]/members/[person_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { TeamMembership_Details_Card } from '@/components/cards/team-membership-details'

import * as Paths from '@/paths'
import { fetchTeamMembership } from '@/server/fetch'

    

export async function generateMetadata(props: { params: Promise<{ person_id: string, team_id: string }> }) {
    const { person, team } = await fetchTeamMembership(props.params)
    return { title: `${person.name} - ${team.name}` }
}

export default async function System_Team_Member_Page(props: { params: Promise<{ person_id: string, team_id: string }>} ) {
    const { person, team } = await fetchTeamMembership(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin,
                Paths.admin.teams,
                { label: team.name, href: Paths.admin.team(team.teamId).href },
                "Members",
                person.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Team Member">{person.name}</PageTitle>
            </PageHeader>
            <Boundary>
                <TeamMembership_Details_Card 
                    context='team'
                    personId={person.personId}
                    teamId={team.teamId}
                />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
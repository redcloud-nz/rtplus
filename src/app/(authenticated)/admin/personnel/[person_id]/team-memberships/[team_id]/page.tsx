/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/personnel/[person_id]/team-memberships/[team_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { TeamMembership_Details_Card } from '@/components/cards/team-membership-details'

import * as Paths from '@/paths'
import { fetchTeamMembership } from '@/server/fetch'


export async function generateMetadata(props: PageProps<'/admin/personnel/[person_id]/team-memberships/[team_id]'>) {

    const membership = await fetchTeamMembership(props.params)

    return { title: `${membership.person.name} - ${membership.team.name}` }
}

export default async function Person_TeamMembership_Page(props: PageProps<'/admin/personnel/[person_id]/team-memberships/[team_id]'>) {
    const { person, team } = await fetchTeamMembership(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin,
                Paths.admin.personnel,
                { label: person.name, href: Paths.admin.person(person.personId).href },
                Paths.admin.person(person.personId).teamMemberships,
                team.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Team Membership">{team.name}</PageTitle>
            </PageHeader>
            <Boundary>
                <TeamMembership_Details_Card 
                    context='person'
                    personId={person.personId}
                    teamId={team.teamId}
                />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
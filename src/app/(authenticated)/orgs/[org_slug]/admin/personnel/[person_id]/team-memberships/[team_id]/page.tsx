/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/[team_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { TeamMembership_Details_Card } from '@/components/cards/team-membership-details'

import * as Paths from '@/paths'
import { fetchTeamMembership } from '@/server/fetch'


export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/[team_id]'>) {
    const { org_slug: orgSlug, person_id: personId, team_id: teamId } = await props.params
    const membership = await fetchTeamMembership({ orgSlug, personId, teamId })

    return { title: `${membership.person.name} - ${membership.team.name}` }
}

export default async function AdminModule_Person_TeamMembership_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/[team_id]'>) {
    const { org_slug: orgSlug, person_id: personId, team_id: teamId } = await props.params
    const { person, team } = await fetchTeamMembership({ orgSlug, personId, teamId })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule(orgSlug),
                Paths.adminModule(orgSlug).personnel,
                { label: person.name, href: Paths.adminModule(orgSlug).person(personId).href },
                Paths.adminModule(orgSlug).person(personId).teamMemberships,
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
                    orgSlug={orgSlug}
                    personId={personId}
                    teamId={teamId}
                />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
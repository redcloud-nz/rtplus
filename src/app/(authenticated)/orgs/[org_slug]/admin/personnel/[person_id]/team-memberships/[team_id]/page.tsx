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
import { getOrganization } from '@/server/organization'


export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/[team_id]'>) {
    const { org_slug: orgSlug, person_id: personId, team_id: teamId } = await props.params
    const organization = await getOrganization(orgSlug)

    const membership = await fetchTeamMembership({ orgId: organization.orgId, personId, teamId })

    return { title: `${membership.person.name} - ${membership.team.name}` }
}

export default async function AdminModule_Person_TeamMembership_Page(props: PageProps<'/orgs/[org_slug]/admin/personnel/[person_id]/team-memberships/[team_id]'>) {
    const { org_slug: orgSlug, person_id: personId, team_id: teamId } = await props.params
    const organization = await getOrganization(orgSlug)
    const { person, team } = await fetchTeamMembership({ orgId: organization.orgId, personId, teamId })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.personnel,
                { label: person.name, href: Paths.org(orgSlug).admin.person(personId).href },
                Paths.org(orgSlug).admin.person(personId).teamMemberships,
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
                    organization={organization}
                    personId={personId}
                    teamId={teamId}
                />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
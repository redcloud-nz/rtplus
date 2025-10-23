/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/teams/[team_id]/members/[person_id]
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { TeamMembership_Details_Card } from '@/components/cards/team-membership-details'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { fetchTeamMembership } from '@/server/fetch'


    

export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]/members/[person_id]'>) {
    const { org_slug: orgSlug, team_id: teamId, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)
    const { person, team } = await fetchTeamMembership({ orgId: organization.orgId, teamId, personId })
    return { title: `${person.name} - ${team.name}` }
}

export default async function AdminModule_Team_Member_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]/members/[person_id]'>) {
    const { org_slug: orgSlug, team_id: teamId, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)
    const { person, team } = await fetchTeamMembership({ orgId: organization.orgId, teamId, personId })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.teams,
                { label: team.name, href: Paths.org(orgSlug).admin.team(team.teamId).href },
                Paths.org(orgSlug).admin.team(team.teamId).members,
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
                    organization={organization}
                    personId={person.personId}
                    teamId={team.teamId}
                />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
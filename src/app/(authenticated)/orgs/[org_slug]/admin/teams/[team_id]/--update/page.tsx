/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/teams/[team_id]/--update
 */

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'
import { TeamForm } from '@/components/forms/team-form'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { getTeam } from '@/server/team'



export default async function AdminModule_TeamUpdate_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]/--update'>) {
    const { org_slug: orgSlug, team_id: teamId } = await props.params
    const organization = await getOrganization(orgSlug)
    const team = await getTeam(organization.orgId, teamId)

    return <Lexington.Column width="lg">
        <Hermes.Section>
            <Hermes.SectionHeader>
                <Hermes.BackButton to={Paths.org(organization.slug).admin.team(teamId)}>
                    {team.name}
                </Hermes.BackButton>
            </Hermes.SectionHeader>
            
            <TeamForm
                mode="Update"
                organization={organization} 
                team={team}
            />
        </Hermes.Section>

        
    </Lexington.Column>
}
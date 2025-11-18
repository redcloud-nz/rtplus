/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/teams/[team_id]/members/--create
 */


import { Lexington } from '@/components/blocks/lexington'
import { ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { getTeam } from '@/server/team'

import AdminModule_Team_CreateTeamMembership_Form from './create-team-membership'
import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'


export default async function AdminModule_Team_CreateTeamMembership_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]/members/--create'>) {
    const { org_slug: orgSlug, team_id: teamId } = await props.params
    const organization = await getOrganization(orgSlug)
    const team = await getTeam(organization.orgId, teamId)

    return <Lexington.Column width="lg">

        <Lexington.ColumnControls>
            <S2_Button variant="outline" asChild>
                <Link to={Paths.org(organization.slug).admin.team(team.teamId)}>
                    <ToParentPageIcon/> {team.name}
                </Link>
            </S2_Button>
        </Lexington.ColumnControls>
         <S2_Card>
            <S2_CardHeader>
                <S2_CardTitle>Add a member to {team.name}</S2_CardTitle>
            </S2_CardHeader>
            <S2_CardContent>
                <AdminModule_Team_CreateTeamMembership_Form organization={organization} teamId={teamId} />
            </S2_CardContent>
        </S2_Card>
    </Lexington.Column>
}
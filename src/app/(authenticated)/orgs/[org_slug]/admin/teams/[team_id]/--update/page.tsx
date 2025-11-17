/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]/--update
 */

import { Lexington } from '@/components/blocks/lexington'
import { ToParentPageIcon } from '@/components/icons'
import { Link } from '@/components/ui/link'
import { S2_Button } from '@/components/ui/s2-button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { getTeam } from '@/server/team'
import { AdminModule_TeamUpdate_Form } from './update-team'



export default async function AdminModule_TeamUpdate_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]/--update'>) {
    const { org_slug: orgSlug, team_id: teamId } = await props.params
    const organization = await getOrganization(orgSlug)
    const team = await getTeam(organization.orgId, teamId)

    return <Lexington.Root>
        <Lexington.Header breadcrumbs={[
            Paths.org(organization.slug).admin.teams,
            { href: Paths.org(organization.slug).admin.team(teamId).href, label: teamId },
            Paths.org(organization.slug).admin.team(teamId).update,
        ]}/>
        <Lexington.Page>
            <Lexington.Column width="lg">
                <Lexington.ColumnControls>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <S2_Button variant="outline" asChild>
                                <Link to={Paths.org(organization.slug).admin.team(teamId)}>
                                    <ToParentPageIcon/> Team
                                </Link>
                            </S2_Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            back to the team
                        </TooltipContent>
                    </Tooltip>
                </Lexington.ColumnControls>
                <AdminModule_TeamUpdate_Form organization={organization} teamId={team.teamId} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}
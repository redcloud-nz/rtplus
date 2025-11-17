/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/teams/[team_id]
 */

import { Lexington } from '@/components/blocks/lexington'
import { EditIcon, ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Heading } from '@/components/ui/typography'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { getTeam } from '@/server/team'

import { AdminModule_TeamDetails } from './team-details'
import { TeamDropdownMenu } from './team-dropdown-menu'
import { AdminModule_TeamMembers } from './team-members-2'


export default async function AdminModule_Team_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]'>) {
    const { org_slug: orgSlug, team_id: teamId } = await props.params
    const organization = await getOrganization(orgSlug)
    const team = await getTeam(organization.orgId, teamId)
    
    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.teams,
                team.name
            ]}
        />
        <Lexington.Page>

            <Lexington.Column width="lg">
                <Lexington.ColumnControls>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <S2_Button variant="outline" asChild>
                                <Link to={Paths.org(orgSlug).admin.teams}>
                                    <ToParentPageIcon/> List
                                </Link>
                            </S2_Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            Teams List
                        </TooltipContent>
                    </Tooltip>
                    <ButtonGroup>
                        <S2_Button variant="outline" asChild>
                            <Link to={Paths.org(orgSlug).admin.team(team.teamId).update}>
                                <EditIcon/> Edit
                            </Link>
                        </S2_Button>
                        <TeamDropdownMenu organization={organization} team={team}/>
                    </ButtonGroup>
                </Lexington.ColumnControls>

                <AdminModule_TeamDetails organization={organization} teamId={team.teamId}/>

                <Heading level={3} className="mt-6">Team Members</Heading>
                <AdminModule_TeamMembers organization={organization} teamId={team.teamId}/>
            </Lexington.Column>
        </Lexington.Page>
        
    </Lexington.Root>
 }
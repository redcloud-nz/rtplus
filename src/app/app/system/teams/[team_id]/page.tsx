/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/teams/[team_id]
 */

import { TeamDetailsCard } from './team-details'
import { TeamMembersCard } from './team-members'
import { TeamUsersCard } from './team-users'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import { getTeam, TeamParams } from '.'

export async function generateMetadata(props: { params: Promise<TeamParams> }) {
    const team = await getTeam(props.params)
    
    return { title: `${team.shortName || team.name} - Teams` }
}


export default async function TeamPage(props: { params: Promise<TeamParams> }) { 

    const team = await getTeam(props.params)
    
        return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[
                    Paths.system, 
                    Paths.system.teams,
                    team.shortName || team.name
                ]}
            />
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle objectType="Team">{team.name}</PageTitle>
                </PageHeader>
    
                <TeamDetailsCard teamId={team.id}/>
                <TeamMembersCard team={team}/>
                <TeamUsersCard team={team}/>
            </AppPageContent>
        </AppPage>
 }
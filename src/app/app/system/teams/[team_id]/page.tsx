/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/sytem/teams/[team_id]
 */


import { TeamDetailsCard_sys } from './team-details'
import { TeamMembersCard_sys } from './team-members-list'
import { TeamUsersCard_sys } from './team-users-list'

import { getTeam, TeamParams } from '.'
import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'


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

            <TeamDetailsCard_sys teamId={team.id}/>
            <TeamMembersCard_sys team={team}/>
            <TeamUsersCard_sys teamId={team.id}/>
        </AppPageContent>
    </AppPage>
}




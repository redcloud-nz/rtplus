/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/teams/[team_id]
 */



import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { HydrateClient } from '@/trpc/server'

import { TeamDetailsCard } from './team-details'
import { TeamMembersCard } from './team-members'
import { TeamUsersCard } from './team-users'
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
            <HydrateClient>
                <AppPageContent variant="container">
                    <PageHeader>
                        <PageTitle objectType="Team">{team.name}</PageTitle>
                    </PageHeader>
        
                    <Boundary>
                        <TeamDetailsCard teamId={team.id}/>
                    </Boundary>
                    <Boundary>
                        <TeamMembersCard teamId={team.id}/>
                    </Boundary>
                    <Boundary>
                            <TeamUsersCard team={team}/>
                    </Boundary>
                </AppPageContent>
            </HydrateClient>
            
        </AppPage>
 }
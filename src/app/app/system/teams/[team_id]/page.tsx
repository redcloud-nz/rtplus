/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/teams/[team_id]
 */



import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchTeam } from '@/server/fetch'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { TeamDetailsCard } from './team-details'
import { TeamMembersCard } from './team-members'
import { TeamUsersCard } from './team-users'



export async function generateMetadata(props: { params: Promise<{ team_id: string }> }) {
    const team = await fetchTeam(props.params)
    
    return { title: `${team.shortName || team.name} - Teams` }
}


export default async function TeamPage(props: { params: Promise<{ team_id: string }> }) { 
    const team = await fetchTeam(props.params)

    prefetch(trpc.teamMemberships.byTeam.queryOptions({ teamId: team.teamId }))
    
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
                    <TeamDetailsCard teamId={team.teamId}/>
                </Boundary>
                <Boundary>
                    <TeamMembersCard teamId={team.teamId}/>
                </Boundary>
                <Boundary>
                    <TeamUsersCard teamId={team.teamId}/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
 }
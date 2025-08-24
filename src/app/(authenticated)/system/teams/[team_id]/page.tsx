/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/teams/[team_id]
 */

import { notFound } from 'next/navigation'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchTeamByIdCached } from '@/server/data/team'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { System_Team_Details_Card } from './system-team-details'
import { System_Team_Members_Card } from './system-team-members'
import { TeamUsersCard } from './system-team-users'




export async function generateMetadata(props: { params: Promise<{ team_id: string }> }) {
    const team = await fetchTeamByIdCached((await props.params).team_id) ?? notFound()
    
    return { title: `${team.shortName || team.name} - Teams` }
}


export default async function System_Team_Page(props: { params: Promise<{ team_id: string }> }) { 
    const team =  await fetchTeamByIdCached((await props.params).team_id) ?? notFound()

    prefetch(trpc.teamMemberships.getTeamMemberships.queryOptions({ teamId: team.id }))
    
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
                    <System_Team_Details_Card teamId={team.id}/>
                </Boundary>
                <Boundary>
                    <System_Team_Members_Card teamId={team.id}/>
                </Boundary>
                <Boundary>
                    <TeamUsersCard teamId={team.id}/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
 }
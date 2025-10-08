/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/teams/[team_id]
 */

import { notFound } from 'next/navigation'
import { cache } from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import { toTeamData } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import prisma from '@/server/prisma'

import { TeamDetails_Card } from './team-details'
import { TeamMembers_Card } from './team-members'



const fetchTeam = cache(async (props: PageProps<'/admin/teams/[team_id]'>) => {
    const { team_id } = await props.params

    const team = await prisma.team.findUnique({
        where: { teamId: team_id }
    })

    if (!team) notFound()
    return toTeamData(team)
})



export async function generateMetadata(props: PageProps<'/admin/teams/[team_id]'>) {
    const team = await fetchTeam(props)
    
    return { title: `${team.name} - Teams` }
}


export default async function Team_Page(props: PageProps<'/admin/teams/[team_id]'>) {
    const team = await fetchTeam(props)
    
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin, 
                Paths.admin.teams,
                team.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Team">{team.name}</PageTitle>
            </PageHeader>

            <Boundary>
                <TeamDetails_Card teamId={team.teamId}/>
            </Boundary>
            <Boundary>
                <TeamMembers_Card teamId={team.teamId}/>
            </Boundary>
        </AppPageContent>
        
    </AppPage>
 }
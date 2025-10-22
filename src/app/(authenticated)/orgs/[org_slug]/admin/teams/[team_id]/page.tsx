/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/teams/[team_id]
 */

import { notFound } from 'next/navigation'
import { cache } from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import { toTeamData } from '@/lib/schemas/team'
import * as Paths from '@/paths'
import prisma from '@/server/prisma'

import { AdminModule_TeamDetails } from './team-details'
import { AdminModule_Team_Members } from './team-members'



const fetchTeam = cache(async (teamId: string) => {
    

    const team = await prisma.team.findUnique({
        where: { teamId }
    })

    if (!team) notFound()
    return toTeamData(team)
})



export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]'>) {
    const { team_id } = await props.params
    const team = await fetchTeam(team_id)
    
    return { title: `${team.name} - Teams` }
}


export default async function AdminModule_Team_Page(props: PageProps<'/orgs/[org_slug]/admin/teams/[team_id]'>) {
    const { org_slug: orgSlug, team_id: teamId } = await props.params
    const team = await fetchTeam(teamId)
    
    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule(orgSlug),
                Paths.adminModule(orgSlug).teams,
                team.name
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Team">{team.name}</PageTitle>
            </PageHeader>

            <Boundary>
                <AdminModule_TeamDetails orgSlug={orgSlug} teamId={team.teamId}/>
            </Boundary>
            <Boundary>
                <AdminModule_Team_Members orgSlug={orgSlug} teamId={team.teamId}/>
            </Boundary>
        </AppPageContent>
        
    </AppPage>
 }
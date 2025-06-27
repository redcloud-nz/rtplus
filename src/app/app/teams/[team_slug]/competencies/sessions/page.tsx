/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/teams/[team-slug]/competencies/sessions
 */

import { Metadata } from 'next'

import { getTeam, TeamParams } from '@/app/app/teams/[team_slug]'
import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'
import { MySessionsListCard } from './sessions-list'



export async function generateMetadata(props: { params: Promise<TeamParams> }): Promise<Metadata> {
    const team = await getTeam(props.params)

    return { title: `Competencies - ${team.shortName || team.name}` }
}


export default async function SkillCheckSessionListPage(props: { params: Promise<TeamParams>}) {
    const team = await getTeam(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                { label: team.shortName || team.name, href: Paths.team(team.slug).index },
                Paths.team(team.slug).competencies.sessions
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Sessions</PageTitle>
            </PageHeader>
            <MySessionsListCard team={team}/>
        </AppPageContent>
    </AppPage>
}
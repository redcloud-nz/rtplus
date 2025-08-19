/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/reports/team-skills
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchTeam } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'

import { Team_Competencies_Card } from './team-competencies'

export const metadata = { title: 'Competencies' }


export default async function Team_Skills_Report_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeam(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).competencies,
                Paths.team(team).competencies.reports,
                Paths.team(team).competencies.reports.teamCompetencies
            ]}
        />
        <HydrateClient>
            <AppPageContent>
                <PageHeader>
                    <PageTitle objectType="Report">Team Skills</PageTitle>
                </PageHeader>
                <Boundary>
                    <Team_Competencies_Card />
                </Boundary>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}
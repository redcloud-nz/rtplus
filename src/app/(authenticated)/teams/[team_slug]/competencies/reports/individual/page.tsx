/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/reports/individual
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Team_Member_Competencies_Card } from '@/components/cards/team-member-competencies'

import * as Paths from '@/paths'
import { fetchTeam } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'
import { IndividualReport_TeamMemberSelector } from './team-member-selector'


export const metadata = { title: 'Individual Competencies' }


export default async function Team_Member_Skills_Report_Page(props: { params: Promise<{ team_slug: string }>, searchParams: Promise<{ pid?: string }> }) {
    const team = await fetchTeam(props.params)
    const { pid } = await props.searchParams

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).competencies,
                Paths.team(team).competencies.reports,
                Paths.team(team).competencies.reports.individual
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle objectType="Report">Individual Skills</PageTitle>
                    <PageControls>
                        <IndividualReport_TeamMemberSelector personId={pid} />
                    </PageControls>
                </PageHeader>
                <Boundary>
                    { pid ? <Team_Member_Competencies_Card personId={pid}/> : <p>No team member selected</p>}
                </Boundary>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}
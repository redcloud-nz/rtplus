/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/reports/individual
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Team_Member_Skills_Card } from '@/components/cards/team-member-skills'

import * as Paths from '@/paths'
import {  getTeamFromParams } from '@/server/data/team'

import { IndividualReport_TeamMemberSelector } from './team-member-selector'


export const metadata = { title: 'Individual Competencies' }


export default async function Team_Member_Skills_Report_Page(props: { params: Promise<{ team_slug: string }>, searchParams: Promise<{ pid?: string }> }) {
    const team = await getTeamFromParams(props.params)
    const { pid } = await props.searchParams

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(team),
                Paths.org(team).skills,
                Paths.org(team).skills.reports,
                Paths.org(team).skills.reports.individual
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Report">Individual Skills</PageTitle>
                <PageControls>
                    <IndividualReport_TeamMemberSelector personId={pid} teamId={team.teamId}/>
                </PageControls>
            </PageHeader>
            <Boundary>
                { pid ? <Team_Member_Skills_Card personId={pid} teamId={team.teamId} /> : <p>No team member selected</p>}
            </Boundary>
        </AppPageContent>
    </AppPage>
}
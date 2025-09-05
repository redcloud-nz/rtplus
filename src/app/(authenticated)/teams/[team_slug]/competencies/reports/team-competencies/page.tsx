/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/reports/team-skills
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import { ExperimentalFeaturePopup } from '@/components/ui/experimental-feature-popup'
import { GitHubIssueLink } from '@/components/ui/link'
import * as Paths from '@/paths'
import { getTeamFromParams } from '@/server/data/team'



import { Team_Competencies_Card } from './team-competencies'

export const metadata = { title: 'Competencies' }


export default async function Team_Skills_Report_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await getTeamFromParams(props.params)

    return <AppPage
        rightControls={<ExperimentalFeaturePopup>
            <p>This page is an experimental feature. See <GitHubIssueLink issueNumber={15}/> for feedback or suggestions.</p>
        </ExperimentalFeaturePopup>}
    >
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).competencies,
                Paths.team(team).competencies.reports,
                Paths.team(team).competencies.reports.teamCompetencies
            ]}
        />
        <AppPageContent variant="full">
            <Boundary>
                <Team_Competencies_Card teamId={team.teamId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
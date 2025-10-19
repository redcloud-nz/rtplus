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



import { Team_Skills_Card } from './team-skills'

export const metadata = { title: 'Team Skills' }


export default async function Team_Skills_Report_Page() {

    return <AppPage
        rightControls={<ExperimentalFeaturePopup>
            <p>This page is an experimental feature. See <GitHubIssueLink issueNumber={15}/> for feedback or suggestions.</p>
        </ExperimentalFeaturePopup>}
    >
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.skillsModule,
                Paths.skillsModule.reports,
                Paths.skillsModule.reports.teamSkills
            ]}
        />
        <AppPageContent variant="full">
            <Boundary>
                <Team_Skills_Card/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
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

import { IndividualReport_TeamMemberSelector } from './team-member-selector'


export const metadata = { title: 'Individual Competencies' }


export default async function Team_Member_Skills_Report_Page(props: { searchParams: Promise<{ pid?: string }> }) {
    const { pid } = await props.searchParams

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.skillsModule,
                Paths.skillsModule.reports,
                Paths.skillsModule.reports.individual
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Report">Individual Skills</PageTitle>
                <PageControls>
                    <IndividualReport_TeamMemberSelector personId={pid}/>
                </PageControls>
            </PageHeader>
            <Boundary>
                { pid ? <Team_Member_Skills_Card personId={pid} /> : <p>No team member selected</p>}
            </Boundary>
        </AppPageContent>
    </AppPage>
}
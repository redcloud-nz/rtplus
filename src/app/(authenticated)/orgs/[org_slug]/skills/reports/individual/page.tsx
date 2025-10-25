/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skills/reports/individual
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Team_Member_Skills_Card } from '@/components/cards/team-member-skills'

import * as Paths from '@/paths'

import { IndividualReport_TeamMemberSelector } from './team-member-selector'
import { getOrganization } from '@/server/organization'


export const metadata = { title: 'Individual Skills' }


export default async function Team_Member_Skills_Report_Page(props: PageProps<'/orgs/[org_slug]/skills/reports/individual'>) {
    
    const { org_slug: orgSlug } = await props.params
    const { pid } = await props.searchParams
    const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).skills,
                Paths.org(orgSlug).skills.reports,
                Paths.org(orgSlug).skills.reports.individual
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Report">Individual Skills</PageTitle>
                <PageControls>
                    <IndividualReport_TeamMemberSelector personId={pid as string}/>
                </PageControls>
            </PageHeader>
            <Boundary>
                { pid ? <Team_Member_Skills_Card organization={organization} personId={pid as string} /> : <p>No team member selected</p>}
            </Boundary>
        </AppPageContent>
    </AppPage>
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skills
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { SessionsCount_Card, SkillChecksCount_Card, SkillsCount_Card, PersonnelCount_Card } from './skill-stats'

export const metadata = { title: 'Skills Dashboard' }


export default async function SkillsModule_Index_Page(props: PageProps<'/orgs/[org_slug]/skills'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.org(orgSlug).skills
        ]}/>
        
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skills Dashboard</PageTitle>
            </PageHeader>
            <div className="grid grid-cols-2 md:grid-col-3 lg:grid-cols-4 gap-4">
                <Boundary>
                    <SkillsCount_Card organization={organization} />
                </Boundary>
                <Boundary>
                    <PersonnelCount_Card organization={organization} />
                </Boundary>
                <Boundary>
                    <SessionsCount_Card organization={organization} />
                </Boundary>
                <Boundary>
                    <SkillChecksCount_Card organization={organization} />
                </Boundary>
            </div>
            <Paragraph>
                Welcome to the RT+ Skills Module.
            </Paragraph>
        </AppPageContent>
    </AppPage>
}



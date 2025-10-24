/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/competencies/skill-checks
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { SkillsModule_SkillChecks_List } from './skill-checks-list'


export const metadata = {
    title: "Skill Checks",
}

export default async function SkillModule_SkillChecks_Page(props: PageProps<'/orgs/[org_slug]/skills/checks'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).skills,
                Paths.org(orgSlug).skills.checks
            ]}
        />
        
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skill Checks</PageTitle>
            </PageHeader>

            <Boundary>
                <SkillsModule_SkillChecks_List organization={organization} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
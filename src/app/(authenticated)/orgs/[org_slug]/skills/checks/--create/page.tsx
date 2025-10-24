/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skills/checks/--create
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { SkillsModule_NewCheck_Form } from './team-new-check'
import { getOrganization } from '@/server/organization'


export const metadata = { title: 'Create Skill Check' }

export default async function SkillsModule_NewCheck_Page(props: PageProps<'/orgs/[org_slug]/skills/checks/--create'>) {
    const { org_slug: orgSlug } = await props.params
        const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.org(organization.slug).skills,
                Paths.org(organization.slug).skills.checks,
                Paths.org(organization.slug).skills.checks.create,
            ]}
        />
        <AppPageContent variant="container">
            <Boundary>
                <SkillsModule_NewCheck_Form organization={organization} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}



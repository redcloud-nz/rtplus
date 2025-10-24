/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skills/sessions/--create
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { SkillsModule_NewSession_Form } from './new-session'
import { getOrganization } from '@/server/organization'

export const metadata = { title: `New Skill Check Session` }

export default async function SkillsModule_NewSession_Page(props: PageProps<'/orgs/[org_slug]/skills/sessions/--create'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(organization.slug).skills,
                Paths.org(organization.slug).skills.sessions,
                Paths.org(organization.slug).skills.sessions.create,
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>New Skill Check Session</PageTitle>
            </PageHeader>

            <Boundary>
                <SkillsModule_NewSession_Form organization={organization} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
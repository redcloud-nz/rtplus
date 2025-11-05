/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/skills/sessions/[session_id]/review
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import { TITLE_SEPARATOR } from '@/lib/utils'
import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'
import { getOrganization } from '@/server/organization'

import { SkillsModule_SessionReview_Card } from './session-review'



export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]/review'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})

    return { title: `Review ${TITLE_SEPARATOR} ${session.name}` }
}


export default async function SkillsModule_SessionReview_Page(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]/review'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(organization.slug).skills,
                Paths.org(organization.slug).skills.sessions,
                { href: Paths.org(organization.slug).skills.session(session.sessionId).href, label: session.name },
                Paths.org(organization.slug).skills.session(session.sessionId).review,
            ]}
        />

        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Skill Check Session">{session.name}</PageTitle>
            </PageHeader>
            <Boundary>
                <SkillsModule_SessionReview_Card organization={organization} session={session} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
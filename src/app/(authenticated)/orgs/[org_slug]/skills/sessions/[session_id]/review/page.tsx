/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/skills/sessions/[session_id]/review
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Lexington } from '@/components/blocks/lexington'
import { Boundary } from '@/components/boundary'

import { TITLE_SEPARATOR } from '@/lib/utils'
import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'
import { getOrganization } from '@/server/organization'

import { SkillsModule_SessionReview } from './session-review'




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

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(organization.slug).skills,
                Paths.org(organization.slug).skills.sessions,
                { href: Paths.org(organization.slug).skills.session(session.sessionId).href, label: session.name },
                Paths.org(organization.slug).skills.session(session.sessionId).review,
            ]}
        />

        <Lexington.Page>
            <Lexington.Column width="xl">
                <SkillsModule_SessionReview organization={organization} session={session} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}
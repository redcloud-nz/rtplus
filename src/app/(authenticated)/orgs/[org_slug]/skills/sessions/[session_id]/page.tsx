/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/skills/sessions/[session_id]
 */

import { ArrowRightIcon } from 'lucide-react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Show } from '@/components/show'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'
import { getOrganization } from '@/server/organization'

import { SkillsModule_SessionDetails } from './session-details'




export async function generateMetadata(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})

    return { title: `${session.name} - Skill Check Sessions` }
}

export default async function SkillsModule_Session_Page(props: PageProps<'/orgs/[org_slug]/skills/sessions/[session_id]'>) {
    const { org_slug: orgSlug, session_id: sessionId } = await props.params
    const organization = await getOrganization(orgSlug)
    const session = await fetchSkillCheckSession({ orgId: organization.orgId, sessionId})

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(organization.slug).skills,
                Paths.org(organization.slug).skills.sessions,
                session.name,
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Skill Check Session">{session.name}</PageTitle>
                <PageControls>
                    <Show when={session.sessionStatus == 'Draft'}>
                        <Button asChild>
                            <Link to={Paths.org(organization.slug).skills.session(session.sessionId).record}>
                                <span className="hidden md:inline">Open in</span> Skill Recorder
                                <ArrowRightIcon />
                            </Link>
                        </Button>
                    </Show>
                    
                </PageControls>
            </PageHeader>

            <Boundary>
                <SkillsModule_SessionDetails organization={organization} sessionId={session.sessionId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
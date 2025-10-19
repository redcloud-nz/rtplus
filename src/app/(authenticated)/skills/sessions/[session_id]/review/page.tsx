/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /skills/sessions/[session_id]/review
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'

import { SkillsModule_SessionReview_Card } from './session-review'


export async function generateMetadata(props: PageProps<'/skills/sessions/[session_id]/review'>) {
    const session = await fetchSkillCheckSession(props.params)

    return { title: `Review - ${session.name} - Skill Check Sessions` }
}


export default async function SkillsModule_SessionReview_Page(props: PageProps<'/skills/sessions/[session_id]/review'>) {
    const session = await fetchSkillCheckSession(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.skillsModule,
                Paths.skillsModule.sessions,
                { href: Paths.skillsModule.session(session.sessionId).href, label: session.name },
                Paths.skillsModule.session(session.sessionId).review,
            ]}
        />

        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Skill Check Session">{session.name}</PageTitle>
            </PageHeader>
            <Boundary>
                <SkillsModule_SessionReview_Card session={session} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
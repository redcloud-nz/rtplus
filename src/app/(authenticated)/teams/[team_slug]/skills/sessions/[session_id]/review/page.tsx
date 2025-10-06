/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /teams/[team_slug]/skills/sessions/[session_id]/review
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'

import { Team_Skills_Session_Review_Card } from './team-session-review'


export async function generateMetadata(props: PageProps<'/teams/[team_slug]/skills/sessions/[session_id]'>) {
    const session = await fetchSkillCheckSession(props.params)

    return { title: `Review - ${session.name} - Skill Check Sessions` }
}


export default async function Team_Skills_Session_Review_Page(props: PageProps<'/teams/[team_slug]/skills/sessions/[session_id]/review'>) {
    const session = await fetchSkillCheckSession(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(session.team),
                Paths.team(session.team).skills,
                Paths.team(session.team).skills.sessions,
                Paths.team(session.team).skills.session(session),
                'Review',
            ]}
        />

        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Skill Check Session">{session.name}</PageTitle>
            </PageHeader>
            <Boundary>
                <Team_Skills_Session_Review_Card session={session} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
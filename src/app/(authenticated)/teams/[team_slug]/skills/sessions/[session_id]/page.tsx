/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /teams/[team_slug]/competencies/skill-check-sessions/[session_id]
 */

import { notFound } from 'next/navigation'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { SkillCheckSession_AssesseesList_Card } from '@/components/cards/skill-check-session-assessees-list'
import { SkillCheckSession_AssessorsList_Card } from '@/components/cards/skill-check-session-assessors-list'
import { SkillCheckSession_SkillsList_Card } from '@/components/cards/skill-check-session-skills-list'
import { SkillCheckSession_Transcript_Card } from '@/components/cards/skill-check-session-transcript'
import { Team_Skills_SessionDetails_Card } from '@/components/cards/team-session-details'

import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'



import { GoToRecorder } from './go-to-recorder-button'


export async function generateMetadata(props: { params: Promise<{ session_id: string, team_slug: string }> }) {
    const { session_id: sessionId } = await props.params

    const session = await fetchSkillCheckSession(Promise.resolve({ session_id: sessionId }))
    return {
        title: `${session.name}`,
    }
}

export default async function Team_Skills_Session_Page(props: { params: Promise<{ session_id: string, team_slug: string }> }) {
    const session = await fetchSkillCheckSession(props.params)
    const team = session.team

    if(team.slug != (await props.params).team_slug) {
        // Session doesn't belong to the active team.
        notFound()
    }

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).skills,
                Paths.team(team).skills.sessions,
                session.name
            ]}
        />

        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Skill Check Session">{session.name}</PageTitle>
                <PageControls>
                    <GoToRecorder sessionId={session.sessionId} />
                </PageControls>
            </PageHeader>
            <Boundary>
                <Team_Skills_SessionDetails_Card sessionId={session.sessionId} team={team} />
            </Boundary>
            <Boundary>
                <SkillCheckSession_SkillsList_Card sessionId={session.sessionId} />
            </Boundary>
            <Boundary>
                <SkillCheckSession_AssesseesList_Card sessionId={session.sessionId} />
            </Boundary>
            <Boundary>
                <SkillCheckSession_AssessorsList_Card sessionId={session.sessionId} />
            </Boundary>
            <Boundary>
                <SkillCheckSession_Transcript_Card sessionId={session.sessionId}/>
            </Boundary>
        </AppPageContent>
        
    </AppPage>
}
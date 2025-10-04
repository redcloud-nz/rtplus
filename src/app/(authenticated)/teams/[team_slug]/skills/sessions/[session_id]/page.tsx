/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /teams/[team_slug]/skills/sessions/[session_id]
 */

import { ArrowRightIcon } from 'lucide-react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Show } from '@/components/show'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'

import { Team_Skills_Session_Card } from './team-session'





export async function generateMetadata(props: PageProps<'/teams/[team_slug]/skills/sessions/[session_id]'>) {
    const session = await fetchSkillCheckSession(props.params)

    return { title: `${session.name} - Skill Check Sessions` }
}

export default async function Team_Skills_Session_Page(props: PageProps<'/teams/[team_slug]/skills/sessions/[session_id]'>) {
    const session = await fetchSkillCheckSession(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(session.team),
                Paths.team(session.team).skills,
                Paths.team(session.team).skills.sessions,
                session.name,
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>{session.name}</PageTitle>
                <PageControls>
                    <Show when={session.sessionStatus == 'Draft'}>
                        <Button asChild>
                            <Link to={Paths.tools.skillRecorder.session(session.sessionId)}>
                                <span className="hidden md:inline">Open in</span> Skill Recorder
                                <ArrowRightIcon />
                            </Link>
                        </Button>
                    </Show>
                    
                </PageControls>
            </PageHeader>

            <Boundary>
                <Team_Skills_Session_Card sessionId={session.sessionId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
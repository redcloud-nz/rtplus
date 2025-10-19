/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /skills/sessions/[session_id]
 */

import { ArrowRightIcon } from 'lucide-react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Show } from '@/components/show'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'

import { SkillsModule_SessionDetails } from './session-details'



export async function generateMetadata(props: PageProps<'/skills/sessions/[session_id]'>) {
    const session = await fetchSkillCheckSession(props.params)

    return { title: `${session.name} - Skill Check Sessions` }
}

export default async function SkillsModule_Session_Page(props: PageProps<'/skills/sessions/[session_id]'>) {
    const session = await fetchSkillCheckSession(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.skillsModule,
                Paths.skillsModule.sessions,
                session.name,
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle objectType="Skill Check Session">{session.name}</PageTitle>
                <PageControls>
                    <Show when={session.sessionStatus == 'Draft'}>
                        <Button asChild>
                            <Link to={Paths.skillsModule.session(session.sessionId).record}>
                                <span className="hidden md:inline">Open in</span> Skill Recorder
                                <ArrowRightIcon />
                            </Link>
                        </Button>
                    </Show>
                    
                </PageControls>
            </PageHeader>

            <Boundary>
                <SkillsModule_SessionDetails sessionId={session.sessionId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
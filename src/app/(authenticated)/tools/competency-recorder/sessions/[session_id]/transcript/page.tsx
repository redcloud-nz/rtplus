/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /tools/competency-recorder/sessions/[session_id]/transcript
 */
'use client'


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { useSession } from '../use-session'

import { CompetencyRecorder_Session_Recent } from './competency-recorder-session-recent'


export default function CompetencyRecorder_Session_Transcript_Page() {
    const session = useSession()

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions,
                Paths.tools.competencyRecorder.session(session),
                Paths.tools.competencyRecorder.session(session).transcript,
            ]}
        />
        <AppPageContent variant="container">
            <Boundary>
                <CompetencyRecorder_Session_Recent sessionId={session.sessionId} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
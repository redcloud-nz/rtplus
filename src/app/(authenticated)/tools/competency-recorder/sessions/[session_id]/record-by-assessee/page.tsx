/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]/record-by-assessee
 */
'use client'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'

import { CompetencyRecorder_Session_RecordByAssessee_Card } from './competency-recorder-session-record-by-assessee'
import { Alert } from '@/components/ui/alert'
import { GitHubIssueLink } from '@/components/ui/link'
import * as Paths from '@/paths'

import { useSession } from '../use-session'


export default function CompetencyRecorder_Session_RecordByAssessee_Page() {
    const session = useSession()

    return <AppPage showRightSidebarTrigger>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions,
                Paths.tools.competencyRecorder.session(session),
                Paths.tools.competencyRecorder.session(session).recordByAssessee,
            ]}
        />
        <AppPageContent variant="container">
            <Alert severity="mockup" title="Experimental">
                <p>This page is an experimental feature. See <GitHubIssueLink issueNumber={14}/> for feedback or suggestions.</p>
            </Alert>
            <CompetencyRecorder_Session_RecordByAssessee_Card sessionId={session.sessionId} />
        </AppPageContent>
    </AppPage>
}
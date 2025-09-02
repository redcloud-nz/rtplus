/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]/record-by-assessee
 */
'use client'

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { ExperimentalFeaturePopup } from '@/components/ui/experimental-feature-popup'
import { GitHubIssueLink } from '@/components/ui/link'

import * as Paths from '@/paths'

import { useSession } from '../use-session'
import { CompetencyRecorder_Session_RecordByAssessee_Form } from './competency-recorder-session-record-by-assessee'





export default function CompetencyRecorder_Session_RecordByAssessee_Page() {
    const session = useSession()

    return <AppPage 
        showRightSidebarTrigger
        rightControls={<ExperimentalFeaturePopup>
            <p>This page is an experimental feature. See <GitHubIssueLink issueNumber={14}/> for feedback or suggestions.</p>
        </ExperimentalFeaturePopup>}
    >
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions,
                Paths.tools.competencyRecorder.session(session),
                Paths.tools.competencyRecorder.session(session).recordByAssessee,
            ]}
        />
        <CompetencyRecorder_Session_RecordByAssessee_Form sessionId={session.sessionId} />
    </AppPage>
}
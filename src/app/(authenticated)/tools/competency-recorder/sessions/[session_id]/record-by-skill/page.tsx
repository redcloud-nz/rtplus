/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]/record-by-skill
 */
'use client'

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'

import { CompetencyRecorder_Session_RecordBySkill_PageContent } from './competency-recorder-session-record-by-skill'


import * as Paths from '@/paths'

import { useSession } from '../use-session'
import { ExperimentalFeaturePopup } from '@/components/ui/experimental-feature-popup'
import { GitHubIssueLink } from '@/components/ui/link'


export default function CompetencyRecorder_Session_RecordBySkill_Page() {
    const session = useSession()

    return <AppPage 
        showRightSidebarTrigger
        rightControls={<ExperimentalFeaturePopup>
                <p>This page is an experimental feature. See <GitHubIssueLink issueNumber={13}/> for feedback or suggestions.</p>
            </ExperimentalFeaturePopup>}
    >
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions,
                Paths.tools.competencyRecorder.session(session),
                Paths.tools.competencyRecorder.session(session).recordBySkill,
            ]}
        />
        <CompetencyRecorder_Session_RecordBySkill_PageContent sessionId={session.sessionId} />
    </AppPage>
}
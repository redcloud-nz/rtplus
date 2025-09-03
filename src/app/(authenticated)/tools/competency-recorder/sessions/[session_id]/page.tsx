/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]
 */
'use client'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'

import * as Paths from '@/paths'

import { SkillCheckSession_Details_Card } from './skill-check-session-details'

import { useSession } from './use-session'


export default function CompetencyRecorder_Session_Details_Page() {
    const session = useSession()

    return <AppPage showRightSidebarTrigger>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions,
                Paths.tools.competencyRecorder.session(session),
            ]}
        />
        <AppPageContent variant="container">
            <SkillCheckSession_Details_Card sessionId={session.sessionId} />
        </AppPageContent>
    </AppPage>
}
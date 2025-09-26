/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]
 */
'use client'

import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageControls, PageExplanation } from '@/components/app-page'
import { Separator } from '@/components/ui/separator'

import * as Paths from '@/paths'

import { CompetencyRecorder_Session_Menu } from './session-menu'
import { SkillCheckSession_Details_Card } from './skill-check-session-details'
import { useSession } from './use-session'



export default function CompetencyRecorder_Session_Details_Page() {
    const session = useSession()

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.skillRecorder,
                Paths.tools.skillRecorder.sessions,
                Paths.tools.skillRecorder.session(session),
            ]}
        />
        <AppPageControls>
            <PageExplanation>
                This page provides the details of the skill check session.
            </PageExplanation>
            <Separator orientation="vertical"/>
            <CompetencyRecorder_Session_Menu sessionId={session.sessionId} />
        </AppPageControls>
        
        <AppPageContent variant="full">
            <SkillCheckSession_Details_Card session={session} />
        </AppPageContent>
    </AppPage>
}


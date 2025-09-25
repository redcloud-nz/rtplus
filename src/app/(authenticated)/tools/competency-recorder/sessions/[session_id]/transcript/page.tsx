/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /tools/competency-recorder/sessions/[session_id]/transcript
 */
'use client'


import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageControls, PageExplanation } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Separator } from '@/components/ui/separator'
import { Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'
import { CompetencyRecorder_Session_Menu } from '../session-menu'
import { useSession } from '../use-session'

import { CompetencyRecorder_Session_Transcript_PageContent } from './competency-recorder-session-recent'


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
        <AppPageControls>
            <PageExplanation>
                <Paragraph >
                    This transcript shows the most recent skill checks recorded in this session, with the most recent at the top.
                </Paragraph>
            </PageExplanation>
            <Separator orientation="vertical"/>
            <CompetencyRecorder_Session_Menu sessionId={session.sessionId} />
        </AppPageControls>
        <AppPageContent variant="container">
            <Boundary>
                <CompetencyRecorder_Session_Transcript_PageContent sessionId={session.sessionId} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
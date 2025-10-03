/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /tools/competency-recorder/sessions/[session_id]/transcript
 */
'use client'


import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageControls, PageExplanation } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'
import { useSession } from '../use-session'

import { SkillRecorder_Session_Transcript_Content } from './skill-recorder-session-transcript'


export default function CompetencyRecorder_Session_Transcript_Page() {
    const session = useSession()

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.skillRecorder,
                //Paths.tools.skillRecorder.sessions,
                Paths.tools.skillRecorder.session(session),
                Paths.tools.skillRecorder.session(session).transcript,
            ]}
        />
        <AppPageControls>
            <PageExplanation>
                <Paragraph >
                    This transcript shows the most recent skill checks recorded in this session, with the most recent at the top.
                </Paragraph>
            </PageExplanation>
        </AppPageControls>
        <AppPageContent variant="container">
            <Boundary>
                <SkillRecorder_Session_Transcript_Content sessionId={session.sessionId} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
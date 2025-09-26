/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]/record-by-assessee
 */
'use client'


import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageControls, PageExplanation } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { GitHubIssueLink } from '@/components/ui/link'
import { Separator } from '@/components/ui/separator'
import { Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'

import { CompetencyRecorder_Session_Menu } from '../session-menu'
import { useSession } from '../use-session'
import { CompetencyRecorder_Session_RecordByAssessee_PageContent } from './competency-recorder-session-record-by-assessee'


export default function CompetencyRecorder_Session_RecordByAssessee_Page() {
    const session = useSession()

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.skillRecorder,
                Paths.tools.skillRecorder.sessions,
                Paths.tools.skillRecorder.session(session),
                Paths.tools.skillRecorder.session(session).recordByAssessee,
            ]}
        />

        <AppPageControls>
            <PageExplanation>
                <Paragraph>
                    This page allows recording multiple skill-checks for a particular assessee.
                </Paragraph>
                <Paragraph>
                    Select an assessee and then record skill-checks against the skills in this session.
                </Paragraph>
                <Paragraph>
                    This page is an experimental feature. See <GitHubIssueLink issueNumber={14}/> for feedback or suggestions.
                </Paragraph>
            </PageExplanation>
            <Separator orientation="vertical"/>
            <CompetencyRecorder_Session_Menu sessionId={session.sessionId} />
        </AppPageControls>

        <AppPageContent variant="full">
            <Boundary>
                <CompetencyRecorder_Session_RecordByAssessee_PageContent sessionId={session.sessionId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
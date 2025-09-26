/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]/assessors
 */
'use client'

import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageControls, PageExplanation } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Separator } from '@/components/ui/separator'
import { Paragraph } from '@/components/ui/typography'
import * as Paths from '@/paths'

import { CompetencyRecorder_Session_Menu } from '../session-menu'
import { useSession } from '../use-session'
import CompetencyRecorder_Session_Assessors_PageContents from './competency-recorder-session-assessors'


/**
 * Page for managing the assessors assigned to a competency recording session.
 */
export default function CompetencyRecorder_Session_Assessors_Page() {
    const session = useSession()


    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.skillRecorder,
                Paths.tools.skillRecorder.sessions,
                Paths.tools.skillRecorder.session(session),
                Paths.tools.skillRecorder.session(session).assessors
            ]}
        />
        <AppPageControls>
            <PageExplanation>
                <Paragraph>
                    Select the users that should be included as assessors in this competency recorder session.
                </Paragraph >
                <ul className="text-sm pl-1">
                    <li><span className="text-green-600 font-mono text-md pr-1">+</span> indicates an unsaved addition</li>
                    <li><span className="text-red-600 font-mono text-md pr-1">-</span> indicates an unsaved removal</li>
                </ul>
            </PageExplanation>
            <Separator orientation="vertical"/>
            <CompetencyRecorder_Session_Menu sessionId={session.sessionId} />
        </AppPageControls>
        <AppPageContent variant="full">
            <Boundary>
                <CompetencyRecorder_Session_Assessors_PageContents sessionId={session.sessionId} team={session.team} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /tools/competency-recorder/sessions/[session_id]/skills
 */
'use client'

import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageControls, PageExplanation } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Paragraph } from '@/components/ui/typography'
import * as Paths from '@/paths'

import { useSession } from '../use-session'
import SkillRecorder_Session_Skills_Content from './skill-recorder-session-skills'



/**
 * Page for managing the skills assigned to a competency recording session.
 */
export default function CompetencyRecorder_Session_Skills_Page() {
    const session = useSession()

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.skillRecorder,
                //Paths.tools.skillRecorder.sessions,
                Paths.tools.skillRecorder.session(session),
                Paths.tools.skillRecorder.session(session).skills
            ]}
        />

        <AppPageControls>
            <PageExplanation>
                <Paragraph >
                    Select the skills that should be included in this competency recorder session.
                </Paragraph>
                <ul className="text-sm pl-1">
                    <li><span className="text-green-600 font-mono text-md pr-1">+</span> indicates an unsaved addition</li>
                    <li><span className="text-red-600 font-mono text-md pr-1">-</span> indicates an unsaved removal</li>
                </ul>
            </PageExplanation>
        </AppPageControls>

        <AppPageContent variant="full">
             <Boundary>
                <SkillRecorder_Session_Skills_Content sessionId={session.sessionId}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
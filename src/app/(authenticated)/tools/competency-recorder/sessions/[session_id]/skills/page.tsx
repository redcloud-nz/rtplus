/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /tools/competency-recorder/sessions/[session_id]/skills
 */
'use client'

import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageFooter } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { useSession } from '../use-session'
import CompetencyRecorder_Session_Skills_PageContent from './competency-recorder-session-skills'




/**
 * Page for managing the skills assigned to a competency recording session.
 */
export default function CompetencyRecorder_Session_Skills_Page() {
    const session = useSession()

    return <AppPage showRightSidebarTrigger>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions,
                Paths.tools.competencyRecorder.session(session),
                Paths.tools.competencyRecorder.session(session).skills
            ]}
        />
        <AppPageContent variant="full" hasFooter>
             <Boundary>
                <CompetencyRecorder_Session_Skills_PageContent sessionId={session.sessionId}/>
            </Boundary>
        </AppPageContent>
       <AppPageFooter/>
    </AppPage>
}
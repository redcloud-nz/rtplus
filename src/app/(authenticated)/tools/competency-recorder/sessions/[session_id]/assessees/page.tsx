/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /tools/competency-recorder/sessions/[session_id]/assessees
 */
'use client'


import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageFooter} from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { useSession } from '../use-session'
import CompetencyRecorder_Session_Assessees_PageContents from './competency-recorder-session-assessees'

/**
 * Page for managing the assessees assigned to a competency recording session.
 */
export default function CompetencyRecorder_Session_Assessees_Page() {

    const session = useSession()


    return <AppPage showRightSidebarTrigger>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions,
                Paths.tools.competencyRecorder.session(session),
                Paths.tools.competencyRecorder.session(session).assessees
            ]}
        />
        <AppPageContent variant="full" hasFooter>
            <Boundary>
                <CompetencyRecorder_Session_Assessees_PageContents sessionId={session.sessionId} team={session.team}/>
            </Boundary>
        </AppPageContent>
        <AppPageFooter/>
    </AppPage>
}

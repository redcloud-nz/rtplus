/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]
 */
'use client'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Team_Skills_SessionDetails_Card } from '@/components/cards/team-session-details'

import * as Paths from '@/paths'

import { useSession } from './use-session'







export default function CompetencyRecorder_Session_Details_Page() {
    const session = useSession()

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.skillRecorder.label,
                //Paths.tools.skillRecorder.sessions,
                Paths.tools.skillRecorder.session(session),
            ]}
        />

        <AppPageContent variant="container">
            
            <Team_Skills_SessionDetails_Card sessionId={session.sessionId} team={session.team} />
        </AppPageContent>
    </AppPage>
}


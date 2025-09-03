/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]/record-individual
 */
'use client'

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'

import * as Paths from '@/paths'

import { useSession } from '../use-session'

import { CompetencyRecorder_Session_RecordIndividual_PageContent } from './competency-recorder-session-record-individual'


export default function CompetencyRecorder_Session_RecordIndividual_Page() {

    const session = useSession()

    return <AppPage showRightSidebarTrigger>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions,
                Paths.tools.competencyRecorder.session(session),
                Paths.tools.competencyRecorder.session(session).recordIndividual,
            ]}
        />
        <CompetencyRecorder_Session_RecordIndividual_PageContent session={session}/>
    </AppPage>
}
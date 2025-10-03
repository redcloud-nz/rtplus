/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]/record-individual
 */
'use client'

import { AppPage, AppPageBreadcrumbs, AppPageContent, AppPageControls, PageExplanation } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Paragraph } from '@/components/ui/typography'
import * as Paths from '@/paths'

import { useSession } from '../use-session'
import { SkillRecorder_Session_RecordSingle_Content } from './skill-recorder-session-record-single'


export default function CompetencyRecorder_Session_RecordIndividual_Page() {

    const session = useSession()

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.skillRecorder,
                //Paths.tools.skillRecorder.sessions,
                Paths.tools.skillRecorder.session(session),
                Paths.tools.skillRecorder.session(session).recordSingle,
            ]}
        />

        <AppPageControls>
            <PageExplanation>
                <Paragraph>
                    This page allows recording individual skill checks.
                </Paragraph>
            </PageExplanation>
        </AppPageControls>

        <AppPageContent variant="full">
             <Boundary>
                <SkillRecorder_Session_RecordSingle_Content session={session}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
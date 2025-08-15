/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /tools/competency-recorder/sessions/[session_id]/transcript
 */


import { AppPageContent } from '@/components/app-page'
import { CompetencyRecorder_Session_Transcript_Card } from './skill-check-session-transcript'


export default async function CompetencyRecorder_Session_Transcript_Page(props: { params: Promise<{ session_id: string }> }) {
    const { session_id: sessionId } = await props.params

    return <AppPageContent variant="container">
        <CompetencyRecorder_Session_Transcript_Card sessionId={sessionId} />
    </AppPageContent>
}
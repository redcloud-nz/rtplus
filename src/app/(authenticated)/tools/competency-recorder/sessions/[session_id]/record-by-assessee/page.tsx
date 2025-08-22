/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]/record-by-assessee
 */

import { AppPageContent } from '@/components/app-page'

import { CompetencyRecorder_Session_RecordByAssessee_Card } from './competency-recorder-session-record-by-assessee'
import { Alert } from '@/components/ui/alert'
import { GitHubIssueLink } from '@/components/ui/link'


export default async function CompetencyRecorder_Session_RecordByAssessee_Page(props: { params: Promise<{ session_id: string }> }) {
    const { session_id: sessionId } = await props.params

    return <AppPageContent variant="container">
        <Alert severity="mockup" title="Design Mockup">
            {"This page is a design mockup that doesn't actually record any data."}
            <p>See <GitHubIssueLink issueNumber={14}/> for feedback or suggestions.</p>
        </Alert>
        <CompetencyRecorder_Session_RecordByAssessee_Card sessionId={sessionId} />
    </AppPageContent>
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]
 */


import { AppPageContent } from '@/components/app-page'

import { SkillCheckSession_Details_Card } from './skill-check-session-details'


export default async function CompetencyRecorder_Session_Details_Page(props: { params: Promise<{ session_id: string }> }) {
    const { session_id: sessionId } = await props.params

    return <AppPageContent variant="container">
        <SkillCheckSession_Details_Card sessionId={sessionId} />
    </AppPageContent>
}
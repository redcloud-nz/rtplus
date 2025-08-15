/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]/assessors
 */

import { AppPageContent } from '@/components/app-page'
import { SkillCheckSession_AssessorsList_Card } from '@/components/cards/skill-check-session-assessors-list'


export default async function CompetencyRecorder_Session_Assessors_Page(props: { params: Promise<{ session_id: string }> }) {
    const { session_id: sessionId } = await props.params

    return <AppPageContent variant="container">
        <SkillCheckSession_AssessorsList_Card sessionId={sessionId} />
    </AppPageContent>
}
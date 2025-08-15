/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /assessor/sessions/[session_id]/assessors
 */

import { AppPageContent } from '@/components/app-page'
import { CompetencyAssessor_Session_RecordIndividual_Card } from './skill-check-session-assess'


export default async function Assessor_Session_RecordIndividual_Page(props: { params: Promise<{ session_id: string }> }) {
    const { session_id: sessionId } = await props.params

    return <AppPageContent variant="container">
        <CompetencyAssessor_Session_RecordIndividual_Card sessionId={sessionId} />
    </AppPageContent>
}
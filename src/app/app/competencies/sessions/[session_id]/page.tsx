/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/sessions/[session_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import * as Paths from '@/paths'
import { getQueryClient, trpc } from '@/trpc/server'

import { Session_Details_Card } from './session-details'

import { SkillCheckSession_AssesseesList_Card } from '@/components/cards/skill-check-session-assessees-list'
import { SkillCheckSession_AssessorsList_Card } from '@/components/cards/skill-check-session-assessors-list'
import { SkillCheckSession_SkillsList_Card } from '@/components/cards/skill-check-session-skills-list'
import { AssessTabContent } from './assess'
import { TranscriptTabContent } from './transcript'



export const metadata = { title: 'Session - Competencies' }

export default async function SessionPage(props: { params: Promise<{ session_id: string }> }) {
    const { session_id: sessionId } = await props.params

    const queryClient = getQueryClient()
    const session = await queryClient.fetchQuery(trpc.skillCheckSessions.getSession.queryOptions({ sessionId }))

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.competencies.sessions,
                session.name
            ]}
        />
        <AppPageContent variant="container">
            <Tabs defaultValue="Info">
                <TabsList className="mb-4 w-full md:w-auto">
                    <TabsTrigger value="Info">Info</TabsTrigger>
                    <TabsTrigger value="Skills">Skills</TabsTrigger>
                    <TabsTrigger value="Personnel">Personnel</TabsTrigger>
                    <TabsTrigger value="Assess">Assess</TabsTrigger>
                    <TabsTrigger value="Transcript">Transcript</TabsTrigger>
                </TabsList>
                <TabsContent value="Info">
                    <Session_Details_Card sessionId={sessionId} />
                </TabsContent>
                <TabsContent value="Skills">
                    <SkillCheckSession_SkillsList_Card sessionId={sessionId} />
                </TabsContent>
                <TabsContent value="Personnel">
                    <SkillCheckSession_AssesseesList_Card sessionId={sessionId} />
                    <SkillCheckSession_AssessorsList_Card sessionId={sessionId} />
                </TabsContent>
                <TabsContent value="Assess">
                    <AssessTabContent sessionId={sessionId} />
                </TabsContent>
                <TabsContent value="Transcript">
                    <TranscriptTabContent sessionId={sessionId}/>
                </TabsContent>    
            </Tabs>
        </AppPageContent>
    </AppPage>
}
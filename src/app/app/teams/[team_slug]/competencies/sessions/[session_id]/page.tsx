/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/sessions/[session_id]
 */


import { ReactNode } from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'

import * as Paths from '@/paths'
import { getQueryClient, trpc } from '@/trpc/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InfoTabContent } from './info'
import { SkillsTabContent } from './skills'
import { PersonnelTabContent } from './personnel'
import { AssessTabContent } from './assess'
import { TranscriptTabContent } from './transcript'

export const metadata = { title: 'Session - Competencies' }

export default async function SessionLayout(props: { params: Promise<{ team_slug: string, session_id: string }>, children: ReactNode }) {
    const { team_slug: teamSlug, session_id: sessionId } = await props.params

    const queryClient = getQueryClient()
    const session = await queryClient.fetchQuery(trpc.skillCheckSessions.mySessions.byId.queryOptions({ sessionId }))

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(teamSlug!).competencies, 
                Paths.team(teamSlug!).competencies.sessions,
                `Assessment: ${session.name}`
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
                    <InfoTabContent sessionId={sessionId} />
                </TabsContent>
                <TabsContent value="Skills">
                    <SkillsTabContent sessionId={sessionId} />
                </TabsContent>
                <TabsContent value="Personnel">
                    <PersonnelTabContent sessionId={sessionId} />
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
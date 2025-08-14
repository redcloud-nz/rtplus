/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies/sessions/[session_id]
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { SkillCheckSession_AssesseesList_Card } from '@/components/cards/skill-check-session-assessees-list'
import { SkillCheckSession_AssessorsList_Card } from '@/components/cards/skill-check-session-assessors-list'
import { SkillCheckSession_SkillsList_Card } from '@/components/cards/skill-check-session-skills-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'

import { SkillCheckSession_Assess_Card } from './skill-check-session-assess'
import { SkillCheckSession_Details_Card } from './skill-check-session-details'
import { SkillCheckSession_Transcript_Card } from './skill-check-session-transcript'
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { NavItem, NavSection } from '@/components/nav/nav-section'




export async function generateMetadata(props: { params: Promise<{ session_id: string }> }) {
    const session = await fetchSkillCheckSession(props.params)

    return {
        title: `${session.name} - Skill Check Sessions`,
    }
}

export default async function SessionPage(props: { params: Promise<{ session_id: string }> }) {

    const session = await fetchSkillCheckSession(props.params)

    return <>
        
        <AppPage showRightSidebarTrigger>
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
                        <SkillCheckSession_Details_Card sessionId={session.sessionId} />
                    </TabsContent>
                    <TabsContent value="Skills">
                        <SkillCheckSession_SkillsList_Card sessionId={session.sessionId} />
                    </TabsContent>
                    <TabsContent value="Personnel">
                        <SkillCheckSession_AssesseesList_Card sessionId={session.sessionId} />
                        <SkillCheckSession_AssessorsList_Card sessionId={session.sessionId} />
                    </TabsContent>
                    <TabsContent value="Assess">
                        <SkillCheckSession_Assess_Card sessionId={session.sessionId} />
                    </TabsContent>
                    <TabsContent value="Transcript">
                        <SkillCheckSession_Transcript_Card sessionId={session.sessionId}/>
                    </TabsContent>    
                </Tabs>
            </AppPageContent>
        </AppPage>
        <Sidebar side="right">
            <SidebarRail side="right" />
            <SidebarHeader>
                <h2 className="text-lg text-center font-medium">Competency Assessor</h2>
            </SidebarHeader>
            <SidebarContent>
                <NavSection title="Session Configuration">
                
                    <NavItem href="./" label="Details"/>
                    <NavItem href="./skills" label="Skills"/>
                    <NavItem href="./assessors" label="Assessors"/>
                    <NavItem href="./assessees" label="Assessees"/>
                    
                </NavSection>
                <NavSection title="Result">
                    <NavItem href="./transcript" label="Transcript"/>
                </NavSection>
            </SidebarContent>
            
        </Sidebar>
    </>
    
}
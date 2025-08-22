/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]
 */

import { AppPage, AppPageBreadcrumbs} from '@/components/app-page'

import { NavItem, NavSection } from '@/components/nav/nav-section'
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'


export async function generateMetadata(props: { params: Promise<{ session_id: string }> }) {
    const session = await fetchSkillCheckSession(props.params)

    return {
        title: `${session.name} - Competency Assessor`,
    }
}

export default async function CompetencyRecorder_Session_Layout(props: { params: Promise<{ session_id: string }>, children: React.ReactNode }) {
    const session = await fetchSkillCheckSession(props.params)
    const sessionId = session.sessionId

    const sessionPath = Paths.tools.competencyRecorder.session(session.sessionId)

    prefetch(trpc.currentUser.getPerson.queryOptions())
    prefetch(trpc.skills.getTree.queryOptions())
    prefetch(trpc.skillCheckSessions.getAssessees.queryOptions({ sessionId }))
    prefetch(trpc.skillCheckSessions.getAssessors.queryOptions({ sessionId }))
    prefetch(trpc.skillCheckSessions.getChecks.queryOptions({ sessionId }))
    prefetch(trpc.skillCheckSessions.getSkills.queryOptions({ sessionId }))

    return <>
            <AppPage showRightSidebarTrigger>
                <AppPageBreadcrumbs
                    breadcrumbs={[
                        Paths.tools.competencyRecorder,
                        Paths.tools.competencyRecorder.sessions,
                        session.name
                    ]}
                />
                <HydrateClient>
                    {props.children}
                </HydrateClient>
                
            </AppPage>
            <Sidebar side="right">
                <SidebarRail side="right" />
                <SidebarHeader>
                    <h2 className="text-lg text-center font-medium">Competency Assessor</h2>
                </SidebarHeader>
                <SidebarContent>
                    <NavSection title="Session Configuration">
                    
                        <NavItem path={sessionPath} label="Details"/>
                        <NavItem path={sessionPath.skills} />
                        <NavItem path={sessionPath.assessees} />
                        <NavItem path={sessionPath.assessors} />

                    </NavSection>
                    <NavSection title="Record">
                        <NavItem path={sessionPath.recordIndividual} />
                        <NavItem path={sessionPath.recordByAssessee} />
                        <NavItem path={sessionPath.recordBySkill} />
                    </NavSection>
                    <NavSection title="Result">
                        <NavItem path={sessionPath.transcript} />
                    </NavSection>
                </SidebarContent>
                
            </Sidebar>
        </>
}
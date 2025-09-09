/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions/[session_id]
 */

import { NavItem, NavSection } from '@/components/nav/nav-section'
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import * as Paths from '@/paths'
import { fetchSkillCheckSession } from '@/server/fetch'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { SessionProvider } from './use-session'


export async function generateMetadata(props: { params: Promise<{ session_id: string }> }) {
    const session = await fetchSkillCheckSession(props.params)

    return { title: `${session.name}` }
}

export default async function CompetencyRecorder_Session_Layout(props: { params: Promise<{ session_id: string }>, children: React.ReactNode }) {
    const session = await fetchSkillCheckSession(props.params)

    const sessionPath = Paths.tools.competencyRecorder.session(session.sessionId)

    prefetch(trpc.currentUser.getPerson.queryOptions())
    prefetch(trpc.skills.getAvailablePackages.queryOptions())
    prefetch(trpc.skillChecks.getSessionAssessees.queryOptions({ sessionId: session.sessionId }))
    prefetch(trpc.skillChecks.getSessionAssessors.queryOptions({ sessionId: session.sessionId }))
    prefetch(trpc.skillChecks.getSessionSkillIds.queryOptions({ sessionId: session.sessionId }))

    return <>
        <HydrateClient>
            <SessionProvider value={session}>
                {props.children}
            </SessionProvider>
        </HydrateClient>
        <Sidebar side="right">
            <SidebarRail side="right" />
            <SidebarHeader>
                <h2 className="text-lg text-center font-medium">Competency Assessor</h2>
            </SidebarHeader>
            <SidebarContent>
                <NavSection title="Session Configuration">

                    <NavItem path={sessionPath} label="Details"/>
                    <NavItem path={sessionPath.skills}/>
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
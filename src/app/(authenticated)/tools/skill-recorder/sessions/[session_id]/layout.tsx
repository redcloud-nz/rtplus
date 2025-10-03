/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/skill-recorder/sessions/[session_id]
 */

import { fetchSkillCheckSession } from '@/server/fetch'

import { AppSidebar } from '@/components/nav/app-sidebar'
import { NavItem, NavSection, NavSectionHeadingLink } from '@/components/nav/nav-section'
import { NavTeamSection } from '@/components/nav/nav-team-section'

import { Separator } from '@/components/ui/separator'

import * as Paths from '@/paths'

import { SessionProvider } from './use-session'



export async function generateMetadata(props: { params: Promise<{ session_id: string }> }) {
    const session = await fetchSkillCheckSession(props.params)

    return { title: `${session.name}` }
}

export default async function CompetencyRecorder_Session_Layout(props: { params: Promise<{ session_id: string }>, children: React.ReactNode }) {
    const session = await fetchSkillCheckSession(props.params)

    const path = Paths.tools.skillRecorder.session(session.sessionId)

    return <>
        <AppSidebar>
            <NavTeamSection/>
            <Separator orientation="horizontal"/>
            <NavSection>
                <NavSectionHeadingLink to={path}>Skill Check Session</NavSectionHeadingLink>
                <NavItem path={path.assessees}/>
                <NavItem path={path.skills}/>
                <NavItem path={path.recordSingle}/>
                <NavItem path={path.recordByAssessee}/>
                <NavItem path={path.recordBySkill}/>
                <NavItem path={path.transcript}/>
            </NavSection>
        </AppSidebar>

        <SessionProvider value={session}>
            {props.children}
        </SessionProvider>
    </>
}
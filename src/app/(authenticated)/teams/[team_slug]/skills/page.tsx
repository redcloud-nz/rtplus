/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { TextLink } from '@/components/ui/link'
import { Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'
import { getTeamFromParams } from '@/server/data/team'

import { SessionsCount_Card, SkillChecksCount_Card, SkillsCount_Card, TeamMembersCount_Card } from './skill-stats'


export const metadata = { title: 'Skills Dashboard' }


export default async function Team_Skills_Index_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await getTeamFromParams(props.params)

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.team(team), 
            Paths.team(team).skills
        ]}/>
        
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skills Dashboard</PageTitle>
            </PageHeader>
            <div className="grid grid-cols-2 md:grid-col-3 lg:grid-cols-4 gap-4">
                <Boundary>
                    <SkillsCount_Card team={team}/>
                </Boundary>
                <Boundary>
                    <TeamMembersCount_Card team={team}  />
                </Boundary>
                <Boundary>
                    <SessionsCount_Card team={team} />
                </Boundary>
                <Boundary>
                    <SkillChecksCount_Card team={team} />
                </Boundary>
            </div>
            <Paragraph>
                Welcome to the RT+ skills module. If you are a team admin, you can <TextLink to={Paths.team(team).skills.sessions.create}/> a session or start recording skill checks.
                Everyone (that has access to RT+) can use the <TextLink to={Paths.tools.competencyRecorder}/> to see their assigned sessions and record skill checks for the assigned assessees.
            </Paragraph>
        </AppPageContent>
    </AppPage>
}



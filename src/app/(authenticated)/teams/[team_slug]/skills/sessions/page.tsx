/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /teams/[team-slug]/skills/sessions
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { getTeamFromParams } from '@/server/data/team'

import { Team_Skills_SessionList_Card } from './team-sessions-list'


export const metadata = { title: `Skill Check Sessions` }


export default async function Team_SkillCheckSessionsList_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await getTeamFromParams(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).skills,
                Paths.team(team).skills.sessions,
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skill Check Sessions</PageTitle>
            </PageHeader>
            <Boundary>
                <Team_Skills_SessionList_Card team={team}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
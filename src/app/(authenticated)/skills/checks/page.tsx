/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/skill-checks
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { getTeamFromParams } from '@/server/data/team'

import { Team_Skill_ChecksList_Card } from './team-skill-checks-list'

export const metadata = {
    title: "Skill Checks",
}

export default async function Team_Skills_Checks_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await getTeamFromParams(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(team),
                Paths.org(team).skills,
                Paths.org(team).skills.checks
            ]}
        />
        
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skill Checks</PageTitle>
            </PageHeader>

            <Boundary>
                <Team_Skill_ChecksList_Card team={team}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
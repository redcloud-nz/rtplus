/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/competencies/skills
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchTeamCached } from '@/server/fetch'

import { Team_Competencies_SkillsList_Card } from './team-skills-list'

export const metadata = { title: 'Skills' }


export default async function Team_Competencies_Skills_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamCached((await props.params).team_slug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).competencies,
                Paths.team(team).competencies.skills
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Available Skills</PageTitle>
            </PageHeader>
            <Boundary>
                <Team_Competencies_SkillsList_Card />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
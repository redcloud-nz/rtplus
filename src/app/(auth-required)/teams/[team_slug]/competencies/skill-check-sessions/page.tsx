/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /teams/[team-slug]/competencies/skill-check-sessions
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchTeamBySlug } from '@/server/fetch'


import { HydrateClient } from '@/trpc/server'

import { Team_SkillCheckSessionsList_Card } from './team-sessions-list'


export const metadata = { title: `Skill Check Sessions` }


export default async function Team_SkillCheckSessionsList_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamBySlug(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).competencies,
                Paths.team(team).competencies.sessions,
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Skill Check Sessions</PageTitle>
                </PageHeader>
                <Boundary>
                     <Team_SkillCheckSessionsList_Card/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}
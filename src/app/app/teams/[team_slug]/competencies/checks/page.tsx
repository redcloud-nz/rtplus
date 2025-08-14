/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/teams/[team_slug]/checks
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchTeamBySlug } from '@/server/fetch'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { ActiveTeam_SkillChecksList_Card } from './active-team-skill-checks-list'

export const metadata = {
    title: "Skill Checks",
}

export default async function ActiveTeam_SkillChecks_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamBySlug(props.params)

    prefetch(trpc.activeTeam.skillChecks.getSkillChecks.queryOptions({ }))

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).competencies,
                "Skill Checks"
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Skill Checks</PageTitle>
                </PageHeader>

                <Boundary>
                    <ActiveTeam_SkillChecksList_Card />
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}
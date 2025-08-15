/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /teams/[team_slug]/competencies/skill-check-sessions/--create
 */

import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchTeamBySlug } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'

import { Team_NewSkillCheckSession_Details_Card } from './team-new-session-details'

export const metadata = { title: `New Skill Check Session` }

export default async function Team_NewSkillCheckSession_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamBySlug(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team.slug),
                Paths.team(team.slug).competencies,
                Paths.team(team.slug).competencies.sessions,
                Paths.team(team.slug).competencies.sessions.create,
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>New Skill Check Session</PageTitle>
                </PageHeader>

                <Boundary>
                    <Team_NewSkillCheckSession_Details_Card/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}
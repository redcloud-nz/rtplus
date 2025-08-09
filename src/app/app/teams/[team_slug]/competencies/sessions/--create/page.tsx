/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/teams/[team_slug]/competencies/sessions/--create
 * 
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchTeamBySlug } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'

import { NewSession_Details_Card } from './new-session-details'

export async function generateMetadata(props: { params: Promise<{ team_slug: string }> }): Promise<Metadata> {
    const team = await fetchTeamBySlug(props.params)
    return { title: `Create Session - ${team.shortName || team.name}` }
}

export default async function CreateSessionPage(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamBySlug(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team.slug),
                Paths.team(team.slug).competencies,
                Paths.team(team.slug).competencies.sessions,
                "Create"
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Create Skill Check Session</PageTitle>
                </PageHeader>

                <Boundary>
                    <NewSession_Details_Card/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}
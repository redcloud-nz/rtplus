/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/teams/[team_slug]/members
 */

import { Metadata } from 'next'
import React from 'react'


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchTeamBySlug } from '@/server/fetch'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { ActiveTeam_MembersList_Card } from './team-members-list'


export async function generateMetadata(props: { params: Promise<{ team_slug: string }> }): Promise<Metadata> {
    const team = await fetchTeamBySlug(props.params)
    return { title: `Members - ${team.shortName || team.name}` }
}

export default async function TeamMembersPage(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamBySlug(props.params)

    prefetch(trpc.activeTeam.members.getTeamMembers.queryOptions({}))

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                { label: team.shortName || team.name, href: Paths.team(team.slug).index },
                Paths.team(team.slug).members
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Team Members</PageTitle>
                </PageHeader>

                <Boundary>
                    <ActiveTeam_MembersList_Card/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
            
    </AppPage>
}
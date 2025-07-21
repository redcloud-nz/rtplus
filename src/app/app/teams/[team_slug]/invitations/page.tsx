/*  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/teams/[team_slug]/invitations
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'
import { fetchTeamBySlug } from '@/server/fetch'

import { TeamInvitationsListCard } from './team-invitations-list'



export async function generateMetadata(props: { params: Promise<{ team_slug: string }> }): Promise<Metadata> {
    const team = await fetchTeamBySlug(props.params)
    return { title: `Invitations - ${team.shortName || team.name}` }
}

export default async function TeamInvitationsPage(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamBySlug(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team), 
                Paths.team(team).invitations
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Team Invitations</PageTitle>
            </PageHeader>
            <TeamInvitationsListCard teamId={team.teamId}/>
        </AppPageContent>
    </AppPage>
}
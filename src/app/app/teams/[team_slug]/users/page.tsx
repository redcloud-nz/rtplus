/*  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/teams/[team_slug]/users
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'
import { fetchTeamBySlug } from '@/server/fetch'

import { TeamUsersListCard } from './team-users-list'



export async function generateMetadata(props: { params: Promise<{ team_slug: string }> }): Promise<Metadata> {
    const team = await fetchTeamBySlug(props.params)

    return { title: `Users - ${team.shortName || team.name}` }
}
export default async function TeamUsersPage(props: { params: Promise<{  team_slug: string }> }) {
    const team = await fetchTeamBySlug(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team), 
                Paths.team(team).users
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Team Users</PageTitle>
            </PageHeader>
            <TeamUsersListCard teamId={team.teamId}/>
        </AppPageContent>
    </AppPage>
}
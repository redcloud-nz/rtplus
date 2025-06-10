/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/teams/[team_slug]/members
 */

import { Metadata } from 'next'
import React from 'react'

import { getTeam, TeamParams } from '@/app/manage/teams/[team_slug]'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'

import { TeamMembersListCard } from './team-members-list'


export async function generateMetadata(props: { params: Promise<TeamParams> }): Promise<Metadata> {
    const team = await getTeam(props.params)

    return { title: `Members - ${team.shortName || team.name}` }
}

export default async function TeamMembersPage(props: { params: Promise<TeamParams> }) {
    const team = await getTeam(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            label="Members"
            breadcrumbs={[{ label: team.shortName || team.name, href: Paths.team(team.slug).index }]}
        />
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Team Members</PageTitle>
                </PageHeader>
                <TeamMembersListCard teamSlug={team.slug}/>
            </AppPageContent>
    </AppPage>
}
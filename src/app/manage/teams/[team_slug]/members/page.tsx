/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /manage/teams/[team_slug]/members
 */

import { Metadata } from 'next'
import React from 'react'

import { TeamParams } from '@/app/manage/teams/[team_slug]'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { TeamMembersListCard } from './team-members-list'


export const metadata: Metadata = { title: 'Team Members' }

export default async function TeamMembersPage(props: { params: Promise<TeamParams>}) {
    const { team_slug: teamSlug } = await props.params

    prefetch(trpc.currentTeam.members.queryOptions())

    return (
        <AppPage>
            <AppPageBreadcrumbs
                label="Members"
                breadcrumbs={[{ label: 'Team', href: Paths.team(teamSlug).index }]}
            />
            <HydrateClient>
                <AppPageContent variant="container">
                    <PageHeader>
                        <PageTitle>Team Members</PageTitle>
                    </PageHeader>
                    <TeamMembersListCard />
                </AppPageContent>
            </HydrateClient>
        </AppPage>
    );
}
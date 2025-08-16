/*  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/invitations
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { fetchTeamBySlug } from '@/server/fetch'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { ActiveTeam_Invitations_ListCard } from './team-invitations-list'
import { auth } from '@clerk/nextjs/server'



export const metadata: Metadata = { title: `Team Invitations` }

export default async function Team_InvitationsList_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamBySlug(props.params)

    await auth.protect({ role: 'org:admin' })

    prefetch(trpc.activeTeam.users.getInvitations.queryOptions({}))

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team), 
                Paths.team(team).invitations
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Team Invitations</PageTitle>
                </PageHeader>
                <Boundary>
                    <ActiveTeam_Invitations_ListCard/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}
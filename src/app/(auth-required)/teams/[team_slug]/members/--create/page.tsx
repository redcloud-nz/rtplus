/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/members/--create
 * 
 */

import React from 'react'


import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { fetchTeamBySlug } from '@/server/fetch'
import { HydrateClient } from '@/trpc/server'

import { Team_NewMember_Details_Card } from './new-member-details'


export const metadata = { title: `New Team Member` }

export default async function Team_NewMember_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamBySlug(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                { label: team.shortName || team.name, href: Paths.team(team.slug).index },
                Paths.team(team.slug).members,
                "Create"
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>New Team Member</PageTitle>
                </PageHeader>

                <Boundary>
                    <Team_NewMember_Details_Card/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}
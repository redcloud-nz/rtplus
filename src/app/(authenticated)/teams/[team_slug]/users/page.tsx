/*  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]/users
 */

import { Metadata } from 'next'
import React from 'react'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { getTeamFromParams } from '@/server/data/team'

import { Team_UsersList_Card } from './team-users-list'

export const metadata: Metadata = { title: `Team Users` }

export default async function Team_Users_Page(props: { params: Promise<{  team_slug: string }> }) {
    const team = await getTeamFromParams(props.params)
    
    await auth.protect({ role: 'org:admin' })

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
            <Boundary>
                <Team_UsersList_Card team={team} />
            </Boundary>
        </AppPageContent>
        
    </AppPage>
}
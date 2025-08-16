/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/teams
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { System_TeamsList_Card } from './system-team-list'


export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: "Teams" }


export default async function System_TeamsList_Page() {

    prefetch(trpc.teams.getTeams.queryOptions({ }))

    return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[
                    Paths.system,
                    Paths.system.teams
                ]}
            />
            <HydrateClient>
                 <AppPageContent variant="container">
                    <PageHeader>
                        <PageTitle>Teams</PageTitle>
                    </PageHeader>
                    <Boundary>
                        <System_TeamsList_Card/>
                    </Boundary>
                </AppPageContent>
            </HydrateClient>
           
        </AppPage>
}
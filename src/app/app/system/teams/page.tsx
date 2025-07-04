/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/teams
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'

import { TeamsListCard } from './team-list'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

export const metadata: Metadata = { title: "Teams" }

export default async function TeamsPage() { 
    prefetch(trpc.teams.all.queryOptions())

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
                    <TeamsListCard/>
                </AppPageContent>
            </HydrateClient>
           
        </AppPage>
}
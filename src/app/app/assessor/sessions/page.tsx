/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/assessor/sessions
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'

import { MySessionsList_Card } from './my-sessions-list'


export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Sessions - Assessor' }

export default async function Assessor_SessionsList_Page() {

    prefetch(trpc.skillCheckSessions.getMySessions.queryOptions({ status: ['Discard'] }))

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.assessor,
                Paths.assessor.sessions
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Sessions</PageTitle>
                </PageHeader>
                <Boundary>
                    <MySessionsList_Card />
                </Boundary>
            </AppPageContent>
        </HydrateClient>
    </AppPage>
}
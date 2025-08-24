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

import { CompetencyRecorder_SessionsList_Card } from './my-sessions-list'


export const metadata: Metadata = { title: 'Sessions' }

export default async function CompetencyRecorder_SessionsList_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.tools.competencyRecorder,
                Paths.tools.competencyRecorder.sessions
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Sessions</PageTitle>
            </PageHeader>
            <Boundary>
                <CompetencyRecorder_SessionsList_Card />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /unified/activites
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'
import { UnifiedD4h_Activities_ListCard } from './unified-d4h-activities-list'
import { Boundary } from '@/components/boundary'

export const metadata: Metadata = { title: "Activities" }


export default async function ActivitiesPage() {

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.unifiedD4h,
            Paths.unifiedD4h.activities
        ]}/>
        <AppPageContent>
            <PageHeader>
                <PageTitle>Activities</PageTitle>
                <PageDescription>
                    A list of the activities (events, exercises, and incidents) available from your configured teams.
                </PageDescription>
            </PageHeader>
            <Boundary>
                <UnifiedD4h_Activities_ListCard/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
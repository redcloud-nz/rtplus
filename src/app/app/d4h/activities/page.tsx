/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /unified/activites
 */

import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { D4hActivitiesList_Card } from './d4h-activities-list'



export const metadata: Metadata = { title: "Activities - D4H" }


export default async function D4HActivities_Page() {
    const { sessionClaims: { rt_person_id: personId } } = await auth.protect()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.d4h,
            Paths.d4h.activities
        ]}/>
        <AppPageContent>
            <PageHeader>
                <PageTitle>Activities</PageTitle>
                <PageDescription>
                    A list of the activities (events, exercises, and incidents) available from your configured teams.
                </PageDescription>
            </PageHeader>
            <Boundary>
                <D4hActivitiesList_Card personId={personId} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
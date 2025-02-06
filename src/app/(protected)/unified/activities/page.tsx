/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /unified/activites
 */

import { Metadata } from 'next'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'

import { ActivitiesList } from './activities-list'

export const metadata: Metadata = { title: "Activities" }


export default async function ActivitiesPage() {

    return <AppPage 
        label="Activities" 
        breadcrumbs={[{ label: "D4H Unified", href: "/unified" }]}
    >
        <PageTitle>Activities</PageTitle>
        <PageDescription>
            A list of the activities (events, exercises, and incidents) available from your configured teams.
        </PageDescription>
        <ActivitiesList/>
    </AppPage>
}
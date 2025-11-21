/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/d4h-views/activities
 */

import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { D4hViewsModule_ActivitiesList_Card } from './d4h-activities-list'
import { UserId } from '@/lib/schemas/user'



export const metadata: Metadata = { title: "Activities - D4H" }


export default async function D4hViewsModule_Activities_Page(props: PageProps<'/orgs/[org_slug]/d4h-views/activities'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    const { userId } = await auth.protect()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.org(orgSlug).d4hViews,
            Paths.org(orgSlug).d4hViews.activities
        ]}/>
        <AppPageContent>
            <PageHeader>
                <PageTitle>Activities</PageTitle>
                <PageDescription>
                    A list of the activities (events, exercises, and incidents) available from your configured teams.
                </PageDescription>
            </PageHeader>
            <Boundary>
                <D4hViewsModule_ActivitiesList_Card organization={organization} userId={UserId.parse(userId)} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
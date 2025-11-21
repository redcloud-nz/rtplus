/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/d4h-views/personnel
 */

import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import { UserId } from '@/lib/schemas/user'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { D4hViewsModule_PersonnelList_Card } from './d4h-personnel-list'


export const metadata: Metadata = { title: "Personnel - D4H" }

export default async function D4hViewsModule_Personnel_Page(props: PageProps<'/orgs/[org_slug]/d4h-views/personnel'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    const { userId } = await auth.protect()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.org(orgSlug).d4hViews,
                Paths.org(orgSlug).d4hViews.personnel
        ]}/>
        <AppPageContent>
            <PageHeader>
                <PageTitle>Personnel</PageTitle>
            </PageHeader>
            <Boundary>
                 <D4hViewsModule_PersonnelList_Card organization={organization} userId={UserId.parse(userId)} />
            </Boundary>
        </AppPageContent>
        
    </AppPage>
}
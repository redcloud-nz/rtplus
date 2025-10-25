/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/d4h/personnel
 */

import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { D4hPersonnelList_Card } from './d4h-personnel-list'


export const metadata: Metadata = { title: "Personnel - D4H" }

export default async function D4HPersonnel_Page(props: PageProps<'/orgs/[org_slug]/d4h/personnel'>) {
    const { org_slug: orgSlug } = await props.params

    const { userId } = await auth.protect()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
                Paths.org(orgSlug).d4h,
                Paths.org(orgSlug).d4h.personnel
        ]}/>
        <AppPageContent>
            <PageHeader>
                <PageTitle>Personnel</PageTitle>
            </PageHeader>
            <Boundary>
                 <D4hPersonnelList_Card userId={userId} />
            </Boundary>
        </AppPageContent>
        
    </AppPage>
}
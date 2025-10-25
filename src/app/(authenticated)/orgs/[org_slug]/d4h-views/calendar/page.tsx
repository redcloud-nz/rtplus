/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/d4h-views/calendar
 */
import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent} from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { MonthView } from './month-view'





export const metadata: Metadata = { title: "Calendar - D4H" }

export default async function D4hViewsModule_Calendar_Page(props: PageProps<'/orgs/[org_slug]/d4h-views/calendar'>) {

    const { org_slug: orgSlug } = await props.params
    const { userId } = await auth.protect()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.org(orgSlug).d4hViews, 
            Paths.org(orgSlug).d4hViews.calendar
        ]}/>
        <AppPageContent variant="full">
            <Boundary>
                <MonthView userId={userId} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}



/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/d4h-views/calendar
 */
import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'

import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { UserId } from '@/lib/schemas/user'

import { MonthView } from './month-view'
import { Lexington } from '@/components/blocks/lexington'





export const metadata: Metadata = { title: "Calendar - D4H" }

export default async function D4hViewsModule_Calendar_Page(props: PageProps<'/orgs/[org_slug]/d4h-views/calendar'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    const { userId } = await auth.protect()

    return <Lexington.Root>
        <Lexington.Header breadcrumbs={[
            Paths.org(orgSlug).d4hViews, 
            Paths.org(orgSlug).d4hViews.calendar
        ]}/>
        <Lexington.Page>
            <Boundary>
                <MonthView organization={organization} userId={UserId.parse(userId)} />
            </Boundary>
        </Lexington.Page>
    </Lexington.Root>
}



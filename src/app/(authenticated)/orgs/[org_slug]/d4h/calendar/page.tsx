/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /d4h/calendar
 */
import { Metadata } from 'next'
import React from 'react'

import { auth } from '@clerk/nextjs/server'

import { AppPage, AppPageBreadcrumbs, AppPageContent} from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { MonthView } from './month-view'





export const metadata: Metadata = { title: "Calendar - D4H" }

export default async function D4hCalendar_Page() {
    const { sessionClaims: { rt_person_id: personId } } = await auth.protect()

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.d4hModule, 
            Paths.d4hModule.calendar
        ]}/>
        <AppPageContent variant="full">
            <Boundary>
                <MonthView personId={personId} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}



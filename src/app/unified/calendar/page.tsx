/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /unified/calendar
 */
import { Metadata } from 'next'
import React from 'react'

import { AppPage, PageBoundary } from '@/components/app-page'

import { MonthView } from './month-view'
import { HydrateClient, trpc } from '@/trpc/server'


export const metadata: Metadata = { title: "Calendar | D4H Unified | RT+" }

export default async function CalendarPage() {
    void trpc.currentUser.d4hAccessKeys.prefetch()

    return <AppPage
        label="Calendar"
        breadcrumbs={[{ label: "D4h Unified", href: "/unified" }]}
        variant="full"
    >
        <HydrateClient>
            <PageBoundary>
                <MonthView/>
            </PageBoundary>
        </HydrateClient>
    </AppPage>
}



/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /unified/calendar
 */
import { Metadata } from 'next'
import React from 'react'

import { AppPage } from '@/components/app-page'

import { MonthView } from './month-view'


export const metadata: Metadata = { title: "Calendar | D4H Unified | RT+" }

export default async function CalendarPage() {

    return <AppPage
        label="Calendar"
        breadcrumbs={[{ label: "D4h Unified", href: "/unified" }]}
        variant="full"
    >
        <MonthView/>
    </AppPage>
}



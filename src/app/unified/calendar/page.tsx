
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



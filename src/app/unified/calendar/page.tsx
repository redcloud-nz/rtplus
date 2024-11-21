
import { Metadata } from 'next'
import React from 'react'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage } from '@/components/app-page'
import { Unauthorized } from '@/components/errors'

import { getD4hAccessKeys } from '@/lib/d4h-access-keys'

import { MonthView } from './month-view'


export const metadata: Metadata = { title: "Calendar | D4H Unified | RT+" }

export default async function CalendarPage() {

    const user = await currentUser()
    if(!user) return <Unauthorized label="Personnel"/>
    const accessKeys = await getD4hAccessKeys(user)

    return <AppPage
        label="Calendar"
        breadcrumbs={[{ label: "D4h Unified", href: "/unified" }]}
        variant="full"
    >
        <MonthView accessKeys={accessKeys}/>
    </AppPage>
}



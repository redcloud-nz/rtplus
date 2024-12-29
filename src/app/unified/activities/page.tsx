
import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'

import { ActivitiesList } from './activities-list'


export const metadata: Metadata = { title: "Activities | D4H Unified | RT+" }

export default async function ActivitiesPage() {
    
    await auth.protect()

    return <AppPage 
        label="Activities" 
        breadcrumbs={[{ label: "D4H Unified", href: "/unified" }]}
    >
        <PageTitle>Activities</PageTitle>
        <PageDescription>
            A list of the activities (events, exercises, and incidents) available from your configured teams.
        </PageDescription>
        <ActivitiesList/>
    </AppPage>
}
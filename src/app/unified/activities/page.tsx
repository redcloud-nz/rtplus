
import { Metadata } from 'next'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'
import { Unauthorized } from '@/components/errors'

import { getD4hAccessKeys } from '@/lib/d4h-access-keys'
import { ActivitiesList } from './activities-list'

export const metadata: Metadata = { title: "Activities | D4H Unified | RT+" }

export default async function ActivitiesPage() {
    const user = await currentUser()
    if(!user) return <Unauthorized label="Activities"/>
    const accessKeys = await getD4hAccessKeys(user)

    return <AppPage 
        label="Activities" 
        breadcrumbs={[{ label: "D4H Unified", href: "/unified" }]}
        variant="list"
    >
        <PageTitle>Activities</PageTitle>
        <PageDescription>
            A list of the activities (events, exercises, and incidents) available from your configured teams.
        </PageDescription>
        <ActivitiesList accessKeys={accessKeys}/>
    </AppPage>
}
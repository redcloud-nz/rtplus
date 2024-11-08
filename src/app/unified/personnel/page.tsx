
import { Metadata } from 'next'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'

import { getD4hAccessKeys } from '@/lib/db'

import { PersonnelList } from './personnel-list'
import { currentUser } from '@clerk/nextjs/server'


export const metadata: Metadata = { title: "D4H Access Keys | RT+" }

export default async function PersonnelPage() {

    const user = await currentUser()
    if(!user) throw new Error("Must be logged in to access.")
    const accessKeys = await getD4hAccessKeys(user.id)

    return <AppPage 
        label="Personnel" 
        breadcrumbs={[{ label: "D4H Unified", href: "/unified" }]}
        variant="list"
    >
        <PageTitle>Personnel</PageTitle>
        <PageDescription>
            A list of the personnel available from your configured teams.
        </PageDescription>
        <PersonnelList accessKeys={accessKeys}/>
    </AppPage>
}

import { Metadata } from 'next'

import { currentUser } from '@clerk/nextjs/server'

import { AppPage, PageDescription, PageTitle } from '@/components/app-page'
import { Unauthorized } from '@/components/errors'

import { getD4hAccessKeys } from '@/lib/d4h-access-keys'

import { PersonnelList } from './personnel-list'


export const metadata: Metadata = { title: "Personnel | D4H Unified | RT+" }

export default async function PersonnelPage() {

    const user = await currentUser()
    if(!user) return <Unauthorized label="Personnel"/>
    const accessKeys = await getD4hAccessKeys(user)

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
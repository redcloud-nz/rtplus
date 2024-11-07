
import { Metadata } from 'next'

import { Heading } from '@/components/ui/heading'
import { AppPage } from '@/components/app-page'

import { getD4hAccessKeys } from '@/lib/db'

import { PersonnelList } from './personnel-list'
import { currentUser } from '@clerk/nextjs/server'


export const metadata: Metadata = { title: "D4H Access Keys | RT+" }

export default async function PersonnelPage() {
    const user = await currentUser()
    if(!user) throw new Error("Must be logged in to access.")
    const accessKeys = await getD4hAccessKeys(user.id)

    return <AppPage label="Personnel" breadcrumbs={[{ label: "D4H Unified", href: "/unified" }]}>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <Heading level={1}>Personnel</Heading>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of the personnel available from your configured teams.
                    </p>
                </div>
            </div>
            <PersonnelList accessKeys={accessKeys}/>
        </div>
    </AppPage>
}
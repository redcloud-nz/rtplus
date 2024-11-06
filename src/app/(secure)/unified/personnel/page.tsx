
import { Metadata } from 'next'

import { Heading } from '@/components/ui/heading'
import { SecurePage } from '@/components/secure-page'

import { getD4hAccessKeys } from '@/lib/db'
import { getUserSession } from '@/lib/get-user-session'

import { PersonnelList } from './personnel-list'


export const metadata: Metadata = { title: "D4H Access Keys | RT+" }

export default async function PersonnelPage() {
    const { userId } = await getUserSession()
    const accessKeys = await getD4hAccessKeys(userId)

    return <SecurePage label="Personnel" breadcrumbs={[{ label: "D4H Unified", href: "/unified" }]}>
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
    </SecurePage>
}
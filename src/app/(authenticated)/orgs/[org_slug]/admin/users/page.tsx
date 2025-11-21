/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/users
 */



import { auth } from '@clerk/nextjs/server'

import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import AdminModule_UsersList from './users-list'



export const metadata = { title: "Users" }


export default async function AdminModule_Users_Page(props: PageProps<'/orgs/[org_slug]/admin/users'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    const { userId } = await auth.protect({ role: 'org:admin' })

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).admin, 
                Paths.org(orgSlug).admin.users
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="xl">
                <AdminModule_UsersList organization={organization} currentUserId={userId} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}
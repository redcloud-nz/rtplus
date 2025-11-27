/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/settings
*/

import { auth } from '@clerk/nextjs/server'


import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { AdminModule_OrganizationSettings_Form } from './organization-settings'






export const metadata = { title: "Organisation Settings" }

export default async function AdminModule_OrganizationSettings_Page(props: PageProps<'/orgs/[org_slug]/admin/settings'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    await auth.protect({role: 'admin' })

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.settings
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="lg">
                <AdminModule_OrganizationSettings_Form organization={organization} />
            </Lexington.Column>
            
        </Lexington.Page>
    </Lexington.Root>
}
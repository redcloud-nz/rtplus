/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/settings
 */

import { S2_AppPageHeader } from '@/components/app-page'
import { SidebarInset } from '@/components/ui/sidebar'

import * as Paths from '@/paths'

import { getOrganization } from '@/server/organization'

import { AdminModule_OrganizationSettings_Form } from './organization-settings'
import { clerkAuth } from '@/server/clerk'




export const metadata = { title: "Organisation Settings" }

export default async function AdminModule_OrganizationSettings_Page(props: PageProps<'/orgs/[org_slug]/admin/settings'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    await clerkAuth.protect({role: 'admin' })

    return <SidebarInset>
        <S2_AppPageHeader 
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.settings
            ]}
        />
        <div className="flex flex-1 flex-col gap-4 p-4">
            <AdminModule_OrganizationSettings_Form organization={organization} />
        </div>
    </SidebarInset>
}
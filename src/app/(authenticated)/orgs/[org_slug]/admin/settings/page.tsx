/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/settings
 */

import { AppPage, AppPageBreadcrumbs, ScrollablePageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { Heading } from '@/components/ui/typography'
import { getOrganization } from '@/server/organization'

import { OrganizationSettings } from './organization-settings'



export const metadata = { title: "Organisation Settings" }

export default async function AdminModule_OrganizationSettings_Page(props: PageProps<'/orgs/[org_slug]/admin/settings'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.settings
            ]}
        />

        <ScrollablePageContent>
            <Heading level={1}>Organisation Settings</Heading>

            <Boundary>
                <OrganizationSettings organization={organization} />
            </Boundary>
        </ScrollablePageContent>
    </AppPage> 
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/profile
 */

import { OrganizationProfile } from '@clerk/nextjs'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import * as Paths from '@/paths'

export default async function Organization_Profile_Page(props: PageProps<'/orgs/[org_slug]/admin/profile/[[...organization-profile]]'>) {
    const { org_slug: orgSlug } = await props.params

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[Paths.org(orgSlug).admin, Paths.org(orgSlug).admin.profile]}
        />
        <AppPageContent variant="centered">
            <OrganizationProfile
                path={Paths.org(orgSlug).admin.profile.href}
            />
        </AppPageContent>

    </AppPage>

}
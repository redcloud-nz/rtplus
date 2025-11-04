/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/profile
 */

import { OrganizationProfile } from '@clerk/nextjs'

import * as Paths from '@/paths'
import { Lexington } from '@/components/blocks/lexington'

export default async function Organization_Profile_Page(props: PageProps<'/orgs/[org_slug]/admin/profile/[[...organization-profile]]'>) {
    const { org_slug: orgSlug } = await props.params

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[Paths.org(orgSlug).admin, Paths.org(orgSlug).admin.profile]}
        />
        <Lexington.Page variant="container">
            <OrganizationProfile
                path={Paths.org(orgSlug).admin.profile.href}
            />
        </Lexington.Page>

    </Lexington.Root>

}
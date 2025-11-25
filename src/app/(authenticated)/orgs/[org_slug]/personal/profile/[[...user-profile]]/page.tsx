/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/personal/account
 */

import { UserProfile } from '@clerk/nextjs'

import { Lexington } from '@/components/blocks/lexington'
import * as Paths from '@/paths'


export default async function Personal_Profile_Page(props: PageProps<'/orgs/[org_slug]/personal/profile/[[...user-profile]]'>) {
    const { org_slug: orgSlug} = await props.params

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).personal, 
                Paths.org(orgSlug).personal.profile
            ]}
        />
        <Lexington.Page className="items-center">
            <UserProfile
                path={Paths.org(orgSlug).personal.profile.href}
            />
        </Lexington.Page>
        
    </Lexington.Root>
}
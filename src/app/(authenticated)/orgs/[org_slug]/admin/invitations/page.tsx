/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/admin/invitations
 */

import { auth } from '@clerk/nextjs/server'

import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import AdminModule_InvitationsList from './invitations-list'


export const metadata = { title: "Invitations" }

export default async function AdminModule_Invitations_Page(props: PageProps<'/orgs/[org_slug]/admin/invitations'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    await auth.protect({ role: 'org:admin' })

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).admin, 
                Paths.org(orgSlug).admin.invitations
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="xl">
                <AdminModule_InvitationsList organization={organization} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}

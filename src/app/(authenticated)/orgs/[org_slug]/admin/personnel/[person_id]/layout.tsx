/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]
 */

import { Lexington } from '@/components/blocks/lexington'
import { TITLE_SEPARATOR } from '@/lib/utils'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { getPerson } from '@/server/person'


export async function generateMetadata(props: LayoutProps<'/orgs/[org_slug]/admin/personnel/[person_id]'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)

    const person = await getPerson(organization.orgId, personId)

    return { title: `${person.name} ${TITLE_SEPARATOR} Personnel` }
}

export default async function AdminModule_Person_Layout(props: LayoutProps<'/orgs/[org_slug]/admin/personnel/[person_id]'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)
    
    const person = await getPerson(organization.orgId, personId)

    
    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.personnel,
                person.name
            ]}
        />
        <Lexington.Page>
            {props.children}
        </Lexington.Page>
    </Lexington.Root>
}
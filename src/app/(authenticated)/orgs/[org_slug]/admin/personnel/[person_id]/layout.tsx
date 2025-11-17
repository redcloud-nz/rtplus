/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/admin/personnel/[person_id]
 */

import { TITLE_SEPARATOR } from '@/lib/utils'

import { fetchPerson } from '@/server/fetch'
import { getOrganization } from '@/server/organization'


export async function generateMetadata(props: LayoutProps<'/orgs/[org_slug]/admin/personnel/[person_id]'>) {
    const { org_slug: orgSlug, person_id: personId } = await props.params
    const organization = await getOrganization(orgSlug)

    const person = await fetchPerson({ orgId: organization.orgId, personId })

    return { title: `${person.name} ${TITLE_SEPARATOR} Personnel` }
}

export default async function AdminModule_Person_Layout(props: LayoutProps<'/orgs/[org_slug]/admin/personnel/[person_id]'>) {

    return props.children
}
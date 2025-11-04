/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Paths: /orgs/[org_slug]/dev/table-layout
*/

import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { DevModule_TableLayout } from './table-layout'

export default async function DevModule_TableLayout_Page(props: PageProps<'/orgs/[org_slug]/dev/table-layout'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(organization.slug).dev,
                Paths.org(organization.slug).dev.tableLayout,
            ]}
        />
        <Lexington.Page variant="container">
            <DevModule_TableLayout/>

        </Lexington.Page>
    </Lexington.Root>
}
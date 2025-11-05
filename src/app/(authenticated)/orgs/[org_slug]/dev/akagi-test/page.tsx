/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Paths: /orgs/[org_slug]/dev/table-layout
*/

import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { DevModule_AkagiTest } from './akagi-test'

export default async function DevModule_AkagiTest_Page(props: PageProps<'/orgs/[org_slug]/dev/akagi-test'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(organization.slug).dev,
                Paths.org(organization.slug).dev.tableLayout,
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="xl">
                <DevModule_AkagiTest/>
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}
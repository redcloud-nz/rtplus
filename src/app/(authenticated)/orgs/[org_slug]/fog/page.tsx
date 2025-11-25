/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/fog
 */

import { Lexington } from '@/components/blocks/lexington'
import { NotImplemented } from '@/components/nav/errors'

import * as Paths from '@/paths'

export default async function FOGModule_Page(props: PageProps<'/orgs/[org_slug]/fog'>) {
    const { org_slug: orgSlug } = await props.params

    return <Lexington.Root>
        <Lexington.Header breadcrumbs={[Paths.org(orgSlug).fog]}/>
        <Lexington.Page>
            <NotImplemented />
        </Lexington.Page>
    </Lexington.Root>
}
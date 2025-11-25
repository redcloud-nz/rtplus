/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/personnel/--import
 */


import { Lexington } from '@/components/blocks/lexington'
import { NotImplemented } from '@/components/nav/errors'

import * as Paths from '@/paths'

export default async function ImportPersonnel(props: PageProps<'/orgs/[org_slug]/admin/personnel/--import'>) {
    const { org_slug: orgSlug } = await props.params

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).admin,
                Paths.org(orgSlug).admin.personnel,
                Paths.org(orgSlug).admin.personnel.import
            ]}
        />
        <Lexington.Page>
            <NotImplemented />
        </Lexington.Page>
        
    </Lexington.Root>
}
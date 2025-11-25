/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /checklists
 */

import { Lexington } from '@/components/blocks/lexington'
import { NotImplemented } from '@/components/nav/errors'
import * as Paths from '@/paths'

export default async function ChecklistsModule_Index_Page(props: PageProps<'/orgs/[org_slug]/checklists'>) {
    const { org_slug: orgSlug } = await props.params
        
        return <Lexington.Root>
            <Lexington.Header
                breadcrumbs={[
                    Paths.org(orgSlug).availability,
                ]}
            />
            <Lexington.Page>
                <NotImplemented />
            </Lexington.Page>
            
        </Lexington.Root>
}
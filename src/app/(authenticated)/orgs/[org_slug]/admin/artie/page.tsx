/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/artie
 */

import { Metadata } from 'next'

import * as Paths from '@/paths'

import { ArtieTest } from './artie-test'
import { Lexington } from '@/components/blocks/lexington'


export const metadata: Metadata = { title: "Artie Test" }


export default async function AdminModule_ArtieTest_Page(props: PageProps<'/orgs/[org_slug]/admin/artie'>) {
    const { org_slug: orgSlug } = await props.params

    return <Lexington.Root>
            <Lexington.Header
                breadcrumbs={[
                    Paths.org(orgSlug).admin,
                ]}
            />
            <Lexington.Page>
                <ArtieTest/>
            </Lexington.Page>
           
        </Lexington.Root>
}
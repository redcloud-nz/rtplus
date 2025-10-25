/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/artie
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import * as Paths from '@/paths'

import { ArtieTest } from './artie-test'


export const metadata: Metadata = { title: "Artie Test" }


export default async function AdminModule_ArtieTest_Page(props: PageProps<'/orgs/[org_slug]/admin/artie'>) {
    const { org_slug: orgSlug } = await props.params

    return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[
                    Paths.org(orgSlug).admin,
                    Paths.org(orgSlug).admin.teams
                ]}
            />
            <AppPageContent variant="container">
                <ArtieTest/>
            </AppPageContent>
           
        </AppPage>
}
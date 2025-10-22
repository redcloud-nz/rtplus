/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/teams
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { AdminModule_TeamsList } from './teams-list'


export const metadata: Metadata = { title: "Teams" }


export default async function AdminModule_TeamsList_Page(props: PageProps<'/orgs/[org_slug]/admin/teams'>) {
    const { org_slug: orgSlug } = await props.params


    return <AppPage>
            <AppPageBreadcrumbs breadcrumbs={[
                Paths.adminModule(orgSlug), 
                Paths.adminModule(orgSlug).teams
            ]}/>
            <AppPageContent variant="container">
                <Boundary>
                    <AdminModule_TeamsList orgSlug={orgSlug}/>
                </Boundary>
            </AppPageContent>
           
        </AppPage>
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/artie-test
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import * as Paths from '@/paths'

import { ArtieTest } from './artie-test'


export const metadata: Metadata = { title: "Artie Test" }


export default async function AdminModule_ArtieTest_Page() {

    return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[
                    Paths.adminModule,
                    Paths.adminModule.teams
                ]}
            />
            <AppPageContent variant="container">
                <ArtieTest/>
            </AppPageContent>
           
        </AppPage>
}
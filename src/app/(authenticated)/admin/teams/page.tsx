/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /admin/teams
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

import { TeamsList } from './teams-list'


export const metadata: Metadata = { title: "Teams" }


export default async function TeamsList_Page() {

    return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[
                    Paths.admin,
                    Paths.admin.teams
                ]}
            />
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Teams</PageTitle>
                </PageHeader>
                <Boundary>
                    <TeamsList/>
                </Boundary>
            </AppPageContent>
           
        </AppPage>
}
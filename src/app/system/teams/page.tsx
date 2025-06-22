/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/teams
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import * as Paths from '@/paths'

import { TeamsListCard_sys } from './team-list'



export const metadata: Metadata = { title: "Teams" }

export default async function TeamsPage() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.system,
                Paths.system.teams
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Teams</PageTitle>
            </PageHeader>
            <TeamsListCard_sys/>
        </AppPageContent>
    </AppPage>

}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/teams/[team-slug]/competencies/sessions
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import { Boundary } from '@/components/boundary'
import * as Paths from '@/paths'

export const metadata: Metadata = { title: 'Assessor' }


export default async function Assessor_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[Paths.assessor]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Assessor</PageTitle>
            </PageHeader>
            <Boundary>
                <></>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
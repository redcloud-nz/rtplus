/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/teams/[team-slug]/competencies/sessions
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import { MySessionsList_Card } from './my-sessions-list'
import { Boundary } from '@/components/boundary'

export const metadata: Metadata = { title: 'My Sessions - Competencies' }


export default async function My_SkillCheckSessionsList_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                "Competencies",
                'My Sessions'
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Sessions</PageTitle>
            </PageHeader>
            <Boundary>
                <MySessionsList_Card/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
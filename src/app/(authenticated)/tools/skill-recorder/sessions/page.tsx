/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder/sessions
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { AppSidebar } from '@/components/nav/app-sidebar'
import { NavTeamSection } from '@/components/nav/nav-team-section'
import * as Paths from '@/paths'

import { SkillRecorder_SessionsList_Card } from './skill-recorder-sessions-list'




export const metadata: Metadata = { title: 'Sessions' }

export default async function CompetencyRecorder_SessionsList_Page() {

    return <>
        <AppSidebar>
            <NavTeamSection/>
        </AppSidebar>
    
        <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[
                    Paths.tools.skillRecorder.label,
                    //Paths.tools.skillRecorder.sessions
                ]}
            />
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Sessions</PageTitle>
                </PageHeader>
                <Boundary>
                    <SkillRecorder_SessionsList_Card />
                </Boundary>
            </AppPageContent>
        </AppPage>
    </>
}
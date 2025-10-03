/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { AppSidebar } from '@/components/nav/app-sidebar'
import { NavTeamSection } from '@/components/nav/nav-team-section'
import { DashboardCard, DashboardCardList } from '@/components/ui/dashboard-card'
import { Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'


export const metadata: Metadata = { title: 'Skill Recorder' }


export default async function SkillRecorder_Page() {

    return <>
        <AppSidebar>
            <NavTeamSection/>
        </AppSidebar>
        <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[Paths.tools.skillRecorder]}
            />
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Skill Recorder</PageTitle>
                </PageHeader>
                <Paragraph>
                    Welcome to the RT+ Skill Recorder Tool. 
                </Paragraph>
                <Paragraph>
                    Here you can record skill checks for your team members, either as a single check or as part of a session.
                </Paragraph>
                <DashboardCardList>
                    {/* <DashboardCard
                        linksTo={Paths.tools.skillRecorder.single}
                        iconForeground="text-sky-700"
                        iconBackground="bg-sky-50"
                        description="Record a single skill check."
                    /> */}
                    <DashboardCard
                        linksTo={Paths.tools.skillRecorder.sessions}
                        iconForeground="text-purple-700"
                        iconBackground="bg-purple-50"
                        description="Participate in a skill check session."
                    />
                    <DashboardCard
                        linksTo={Paths.documentation.competencies}
                        iconForeground="text-green-700"
                        iconBackground="bg-green-50"
                        description="View the documentation for the Competency Recorder tool."
                    />
                </DashboardCardList>
            
            </AppPageContent>
        </AppPage>
    </>
    
}
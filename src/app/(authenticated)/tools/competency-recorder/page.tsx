/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /tools/competency-recorder
 */

import { BookOpenIcon, CheckCheckIcon, CheckIcon } from 'lucide-react'
import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { DashboardCard, DashboardCardList } from '@/components/ui/dashboard-card'
import { Paragraph } from '@/components/ui/typography'

import * as Paths from '@/paths'




export const metadata: Metadata = { title: 'Competency Recorder' }


export default async function CompetencyRecorder_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[Paths.tools.competencyRecorder]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Competency Recorder</PageTitle>
            </PageHeader>
            <Paragraph>
                Welcome to the Competency Recorder tool. Here you can record skill checks for your team members, either as a single check or as part of a session.
            </Paragraph>
            <DashboardCardList>
                 <DashboardCard
                    label="Single"
                    href={Paths.tools.competencyRecorder.single.href}
                    icon={CheckIcon}
                    iconForeground="text-sky-700"
                    iconBackground="bg-sky-50"
                    description="Record a single skill check."
                />
                <DashboardCard
                    label="Session"
                    href={Paths.tools.competencyRecorder.sessions.href}
                    icon={CheckCheckIcon}
                    iconForeground="text-purple-700"
                    iconBackground="bg-purple-50"
                    description="Participate in a skill check session."
                />
                <DashboardCard
                    label="Documentation"
                    href={Paths.documentation.competencies.href}
                    icon={BookOpenIcon}
                    iconForeground="text-green-700"
                    iconBackground="bg-green-50"
                    description="View the documentation for the Competency Recorder tool."
                />
            </DashboardCardList>
           
        </AppPageContent>
    </AppPage>
}
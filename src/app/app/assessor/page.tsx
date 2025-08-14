/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/assessor
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { DashboardCard, DashboardCardList } from '@/components/ui/dashboard-card'

import * as Paths from '@/paths'
import { CheckCheckIcon, CheckIcon } from 'lucide-react'
import { Paragraph } from '@/components/ui/typography'


export const metadata: Metadata = { title: 'Competency Assessor' }


export default async function Assessor_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[Paths.assessor]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Assessor</PageTitle>
            </PageHeader>
            <Paragraph>
                Welcome to the Assessor module. Here you can record skill checks for your team members, either as a single check or as part of a session.
            </Paragraph>
            <DashboardCardList>
                 <DashboardCard
                    title="Single"
                    href={Paths.assessor.record.index}
                    icon={CheckIcon}
                    iconForeground="text-sky-700"
                    iconBackground="bg-sky-50"
                    description="Record a single skill check."
                />
                    <DashboardCard
                    title="Session"
                    href={Paths.assessor.sessions.index}
                    icon={CheckCheckIcon}
                    iconForeground="text-purple-700"
                    iconBackground="bg-purple-50"
                    description="Participate in a skill check session."
                />
            </DashboardCardList>
           
        </AppPageContent>
    </AppPage>
}
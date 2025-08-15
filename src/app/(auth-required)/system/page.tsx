/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { DashboardCard, DashboardCardList } from '@/components/ui/dashboard-card'

import * as Paths from '@/paths'


export default function System_Index_Page() {
    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[Paths.system]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>System</PageTitle>
            </PageHeader>
            <DashboardCardList>
                <DashboardCard
                    {...Paths.system.teams}
                    iconBackground='bg-pink-600'
                    iconForeground='text-pink-50'
                    description="Create and manage teams."
                />
                <DashboardCard
                    {...Paths.system.personnel}
                    iconBackground='bg-purple-600'
                    iconForeground='text-purple-50'
                    description="Create and manage personnel."
                />
                <DashboardCard
                    {...Paths.system.skillPackages}
                    iconBackground='bg-yellow-500'
                    iconForeground='text-yellow-50'
                    description='Manage skills packages.'
                />
            </DashboardCardList>
        </AppPageContent>
    </AppPage>
}
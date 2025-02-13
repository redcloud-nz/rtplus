/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system
 */

import { PocketKnifeIcon, ShieldHalfIcon, UsersIcon } from 'lucide-react'

import { AppPage, PageHeader, PageTitle } from '@/components/app-page'
import { DashboardCard, DashboardCardList } from '@/components/ui/dashboard-card'

import * as Paths from '@/paths'


export default function SystemConfigPage() {
    return <AppPage label="System Configuration">
        <PageHeader>
            <PageTitle>System Configuration</PageTitle>
        </PageHeader>
        <DashboardCardList>
            <DashboardCard
                title="Teams"
                href={Paths.config.teams.index}
                icon={ShieldHalfIcon}
                iconBackground='bg-pink-600'
                iconForeground='text-pink-50'
                description="Create and manage teams."
            />
            <DashboardCard
                title="Personnel"
                href={Paths.config.personnel.index}
                icon={UsersIcon}
                iconBackground='bg-purple-600'
                iconForeground='text-purple-50'
                description="Create and manage personnel."
            />
            <DashboardCard
                title="Skills Packages"
                href={Paths.config.skillPackages.index}
                icon={PocketKnifeIcon}
                iconBackground='bg-yellow-500'
                iconForeground='text-yellow-50'
                description='Manage skills packages.'
            />
        </DashboardCardList>
    </AppPage>
}
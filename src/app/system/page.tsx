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


const dataCards: { name: string, initials: string, href: string, bgColor: string }[] = [
    { name: 'Teams', initials: 'T', href: Paths.teams.list, bgColor: 'bg-pink-600' },
    { name: 'Personnel', initials: 'P', href: Paths.personnel, bgColor: 'bg-purple-600' },
    { name: 'Skills', initials: 'S', href: Paths.skillPackagesList, bgColor: 'bg-yellow-500' },
]

export default function SystemConfigPage() {
    return <AppPage label="System Configuration">
        <PageHeader>
            <PageTitle>System Configuration</PageTitle>
        </PageHeader>
        <DashboardCardList>
            <DashboardCard
                title="Teams"
                href={Paths.teams.list}
                icon={ShieldHalfIcon}
                iconBackground='bg-pink-600'
                iconForeground='text-pink-50'
                description="Create and manage teams."
            />
            <DashboardCard
                title="Personnel"
                href={Paths.personnel}
                icon={UsersIcon}
                iconBackground='bg-purple-600'
                iconForeground='text-purple-50'
                description="Create and manage personnel."
            />
            <DashboardCard
                title="Skills"
                href={Paths.skillsList}
                icon={PocketKnifeIcon}
                iconBackground='bg-yellow-500'
                iconForeground='text-yellow-50'
                description='Create and manage skills.'
            />
        </DashboardCardList>
    </AppPage>
}
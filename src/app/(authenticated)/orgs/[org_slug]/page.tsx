/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]
 */

import Image from 'next/image'


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { D4HModuleIcon, AdminModuleIcon, SkillsModuleIcon } from '@/components/icons'
import { DashboardCard, DashboardCardList } from '@/components/ui/dashboard-card'

import * as Paths from '@/paths'
import { getOrganization, isModuleEnabled } from '@/server/organization'
import { Show } from '@/components/show'

export const metadata = { title: 'Dashboard' }

export default async function OrganizationDashboard_Page(props: PageProps<'/orgs/[org_slug]'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={["Dashboard"]}
            />
            <AppPageContent variant="container">
               
                <div className="flex flex-col items-center gap-4 my-4">
                    <Image
                        className="dark:invert"
                        src="/logo.svg"
                        alt="RT+ logo"
                        width={200}
                        height={100}
                        priority
                    />
                    <p>Response Team Management Tools.</p>
                </div>
                <DashboardCardList>
                    <DashboardCard
                        linksTo={Paths.org(orgSlug).admin}
                        icon={<span className="text-emerald-700 bg-emerald-50"><AdminModuleIcon aria-hidden="true" className="size-6" /></span>}
                        description="Administrative tools for managing your organization."
                    />
                    <Show when={isModuleEnabled(organization, 'd4h')}>
                        <DashboardCard
                            linksTo={Paths.org(orgSlug).d4h}
                            icon={<span className="text-indigo-700 bg-indigo-50"><D4HModuleIcon aria-hidden="true" className="size-6" /></span>}
                            description="Alternate views of the data stored in D4H Team Manager. Unified across multiple teams."
                        />
                    </Show>
                    <Show when={isModuleEnabled(organization, 'skills')}>
                        <DashboardCard
                            linksTo={Paths.org(orgSlug).skills}
                            icon={<span className="text-sky-700 bg-sky-50"><SkillsModuleIcon aria-hidden="true" className="size-6" /></span>}
                            description="Manage, assess, and report skills for your team."
                        />
                    </Show>
                </DashboardCardList>
            </AppPageContent>
        </AppPage>
}
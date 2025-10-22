/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin
 */

import Image from 'next/image'


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { PersonnelIcon, SettingsIcon, SkillsModuleIcon, TeamsIcon } from '@/components/icons'
import { ModuleOnly } from '@/components/nav/module-only'
import { DashboardCard, DashboardCardList } from '@/components/ui/dashboard-card'
import * as Paths from '@/paths'



export const metadata = { title: 'Dashboard' }

export default async function AdminModule_Index_Page(props: PageProps<'/orgs/[org_slug]/admin'>) {
    const { org_slug: orgSlug } = await props.params

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule(orgSlug)
            ]}
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
                    linksTo={Paths.adminModule(orgSlug).personnel}
                    description="Manage your organisation's personnel."
                    icon={<span className="text-cyan-700 bg-cyan-50"><PersonnelIcon aria-hidden="true" className="size-6" /></span>}
                />
                    <DashboardCard
                    linksTo={Paths.adminModule(orgSlug).settings}
                    description="Manage your organisation's settings."
                    icon={<span className="text-blue-700 bg-blue-50"><SettingsIcon aria-hidden="true" className="size-6" /></span>}
                />
                <ModuleOnly module="skills">
                    <DashboardCard
                        linksTo={Paths.adminModule(orgSlug).skillPackages}
                        description="Manage the skill-packages owned by your organisation."
                        icon={<span className="text-lime-700 bg-lime-50"><SkillsModuleIcon aria-hidden="true" className="size-6" /></span>}
                    />
                </ModuleOnly>
                
                <DashboardCard
                    linksTo={Paths.adminModule(orgSlug).teams}
                    description="Manage your organisation's teams."
                    icon={<span className="text-violet-700 bg-violet-50"><TeamsIcon aria-hidden="true" className="size-6" /></span>}
                />
            </DashboardCardList>
        </AppPageContent>
    </AppPage>
}
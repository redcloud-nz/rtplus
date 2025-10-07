/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /dashboard
 */

import Image from 'next/image'

import * as Paths from '@/paths'
import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { DashboardCard, DashboardCardList } from '@/components/ui/dashboard-card'


export const metadata = { title: 'Dashboard' }

export default async function Dashboard_Page() {

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
                        {/* <DashboardCard
                            title="Availability"
                            href={teamPath.availability}
                            icon={ClockIcon}
                            iconForeground="text-teal-700"
                            iconBackground="bg-teal-50"
                            description="Collect availabilty from your team."
                        />
                         */}
                        <DashboardCard
                            linksTo={Paths.skills}
                            iconForeground="text-sky-700"
                            iconBackground="bg-sky-50"
                            description="Manage, assess, and report skils for your team."
                        />
                         {/* <DashboardCard
                            linksTo={Paths.org(team).members}
                            iconForeground="text-purple-700"
                            iconBackground="bg-purple-50"
                            description="Manage the members of your team."
                        /> */}
                        {/* <DashboardCard
                            title="Field Operations Guide"
                            href="/fog"
                            icon={NotebookTextIcon}
                            iconForeground="text-yellow-700"
                            iconBackground="bg-yellow-50"
                            description="Digital Field Operations Guide."
                        />
                        <DashboardCard
                            title="Reference Cards"
                            href="/cards"
                            icon={WalletCardsIcon}
                            iconForeground="text-rose-700"
                            iconBackground="bg-rose-50"
                            description="Access the Reference Cards."
                        />
                        */}
                        <DashboardCard
                            linksTo={Paths.d4h}
                            iconForeground="text-indigo-700"
                            iconBackground="bg-indigo-50"
                            description="Alternate views of the data stored in D4H Team Manager. Unified across multiple teams."
                        />
                    </DashboardCardList>
            </AppPageContent>
        </AppPage>
}
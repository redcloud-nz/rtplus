/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /teams/[team_slug]
 */

import Image from 'next/image'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { DashboardCard, DashboardCardList } from '@/components/ui/dashboard-card'

import * as Paths from '@/paths'
import { getTeamFromParams, fetchAllTeamSlugsCached } from '@/server/data/team'

export const revalidate = 600 // 10 minutes

export const metadata = { title: `Team Dashboard` }

export async function generateStaticParams() {
    const teamSlugs = await fetchAllTeamSlugsCached()
    return teamSlugs.map(team_slug => ({ team_slug }))
}

export default async function Team_Dashboard_Page(props: { params: Promise<{ team_slug: string }> }) {
    const team = await getTeamFromParams(props.params)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.team(team),
                Paths.team(team).dashboard
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
                        linksTo={Paths.team(team).competencies}
                        iconForeground="text-sky-700"
                        iconBackground="bg-sky-50"
                        description="Manage, assess, and report competencies for your team."
                    />
                     <DashboardCard
                        linksTo={Paths.team(team).members}
                        iconForeground="text-purple-700"
                        iconBackground="bg-purple-50"
                        description="Manage the members of your team."
                    />
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


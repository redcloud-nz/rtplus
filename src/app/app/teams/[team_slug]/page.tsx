/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/team/[team_slug]
 */

import { CombineIcon, PocketKnifeIcon, UsersIcon } from 'lucide-react'
import Image from 'next/image'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { DashboardCard, DashboardCardList } from '@/components/ui/dashboard-card'

import * as Paths from '@/paths'
import { fetchTeamBySlug } from '@/server/fetch'



// const dataCards: { name: string, initials: string, href: string, bgColor: string }[] = [
//     { name: 'Manage', initials: 'M', href: Paths.system, bgColor: 'bg-blue-500' },
//     { name: 'Teams', initials: 'T', href: Paths.teams.list, bgColor: 'bg-pink-600' },
//     { name: 'Personnel', initials: 'P', href: Paths.personnel, bgColor: 'bg-purple-600' },
//     { name: 'Skill Packages', initials: 'SP', href: Paths.skillPackagesList, bgColor: 'bg-yellow-500' },
// ]

export default async function TeamHomePage(props: { params: Promise<{ team_slug: string }> }) {
    const team = await fetchTeamBySlug(props.params)

    const teamPath = Paths.team(team.slug)

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[team.shortName || team.name]}
        />
        <AppPageContent>
            <div className="container mx-auto">
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
                        title="Competencies"
                        href={teamPath.competencies.index}
                        icon={PocketKnifeIcon}
                        iconForeground="text-sky-700"
                        iconBackground="bg-sky-50"
                        description="Manage, assess, and report competencies for your team."
                    />
                     <DashboardCard
                        title={teamPath.members._label}
                        href={teamPath.members.index}
                        icon={UsersIcon}
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
                        title={Paths.unifiedD4h._label}
                        href={Paths.unifiedD4h.index}
                        icon={CombineIcon}
                        iconForeground="text-indigo-700"
                        iconBackground="bg-indigo-50"
                        description="Alternate views of the data stored in D4H Team Manager. Unified across multiple teams."
                    />
                </DashboardCardList>
            </div>
        </AppPageContent>
    </AppPage>
    
        
}


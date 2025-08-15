/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /teams/--select
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { TeamSwitcher } from '@/components/nav/team-switcher'

import * as Paths from '@/paths'

export const metadata = { title: "Select Team" }

export default function SelectTeam_Page() {

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[Paths.teams.select]}/>
        <AppPageContent variant="container">
            <TeamSwitcher/>
        </AppPageContent>
    </AppPage>
}
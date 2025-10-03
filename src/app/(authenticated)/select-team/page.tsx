/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /select-team
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { AppSidebar } from '@/components/nav/app-sidebar'
import { NavTeamSection } from '@/components/nav/nav-team-section'

import * as Paths from '@/paths'

import SelectTeam_PageContent from './select-team'


export const metadata = {
    title: "Select Team",
    description: "Select which team to use.",
}

/**
 * A page to select which team to use.
 * Also includes:
 * - Switch to personal account
 * - Accept invitations
 */
export default function SelectTeam_Page() {

    return <>
        <AppSidebar>
            <NavTeamSection/>
        </AppSidebar>
        <AppPage>
            <AppPageBreadcrumbs breadcrumbs={[Paths.selectTeam]}/>
            <AppPageContent variant="container">
                <SelectTeam_PageContent/>
            </AppPageContent>
        </AppPage>
    </>
    
    
}

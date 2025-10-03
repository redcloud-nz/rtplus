/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /select-team
 */


import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'

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

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[Paths.selectTeam]}/>
        <AppPageContent variant="container">
            <SelectTeam_PageContent/>
        </AppPageContent>
    </AppPage>
    
    
}

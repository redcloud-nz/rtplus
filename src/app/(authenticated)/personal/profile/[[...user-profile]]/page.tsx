/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /personal/account
 */

import { UserProfile } from '@clerk/nextjs'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'

import * as Paths from '@/paths'

export default function Personal_Profile_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[Paths.personal, Paths.personal.profile]}
        />
        <AppPageContent variant="centered">
            <UserProfile
                path={Paths.personal.profile.href}
            />
        </AppPageContent>
        
    </AppPage>
}
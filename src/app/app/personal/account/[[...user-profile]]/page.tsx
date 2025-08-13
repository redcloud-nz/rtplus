/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /personal/user-profile
 */

import { UserProfile } from '@clerk/nextjs'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'

import * as Paths from '@/paths'

export default function Account_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[Paths.personal, Paths.personal.account]}
        />
        <AppPageContent variant="centered" >
            <UserProfile
                path={Paths.personal.account.index}
            />
        </AppPageContent>
        
    </AppPage>
}
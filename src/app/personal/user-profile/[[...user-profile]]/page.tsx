/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /personal/user-profile
 */

import { UserProfile } from '@clerk/nextjs'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'

import * as Paths from '@/paths'

export default function UserProfilePage() {

    return <AppPage>
        <AppPageBreadcrumbs
            label="User Profile"
            breadcrumbs={[{ label: "Personal", href: Paths.personal.index }]}
        />
        <AppPageContent variant="centered" >
            <UserProfile
                path={Paths.personal.index}
            />
        </AppPageContent>
        
    </AppPage>
}
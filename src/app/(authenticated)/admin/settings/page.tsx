/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { AppPage, AppPageBreadcrumbs, ScrollablePageContent } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { clerkAuth } from '@/server/clerk'


import { OrganizationSettings } from './organization-settings'
import { Heading } from '@/components/ui/typography'



export const metadata = { title: "Organisation Settings" }

export default function AdminModule_OrganizationSettings_Page() {

    clerkAuth.protect({ role: 'org:admin' })

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.adminModule,
                Paths.adminModule.settings
            ]}
        />

        <ScrollablePageContent>
            <Heading level={1}>Organisation Settings</Heading>

            <Boundary>
                <OrganizationSettings/>
            </Boundary>
        </ScrollablePageContent>
    </AppPage> 
}
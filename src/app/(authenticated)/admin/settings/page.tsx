/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'
import { EnabledModulesForm } from './enabled-modules'

export const metadata = { title: "Organisation Settings" }

export default function Admin_OrganizationSettings_Page() {

    return <AppPage>
        <AppPageBreadcrumbs
            breadcrumbs={[
                Paths.admin,
                Paths.admin.settings
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Organisation Settings</PageTitle>
            </PageHeader>
            <Boundary>
                <EnabledModulesForm />
            </Boundary>
        </AppPageContent>
    </AppPage> 
}
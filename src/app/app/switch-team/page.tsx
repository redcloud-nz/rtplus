/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /switch-team
 */

import { OrganizationList } from '@clerk/nextjs'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'


export default function TeamSwitcher() {

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={["Switch Team"]}/>
        <AppPageContent variant="centered">
            <OrganizationList
                hideSlug={false}
                hidePersonal={false}
                afterSelectOrganizationUrl="/app/teams/:slug"
                afterSelectPersonalUrl="/app"
            />
        </AppPageContent>
    </AppPage>
}
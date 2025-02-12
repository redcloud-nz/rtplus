/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /switch-team
 */

import { OrganizationList } from '@clerk/nextjs'

import { AppPage, AppPageContainer } from '@/components/app-page'


export default function TeamSwitcher() {

    return <AppPageContainer>
        <AppPage variant="centered" label="Switch Team">
            <OrganizationList
                hideSlug={false}
                hidePersonal={false}
                afterSelectOrganizationUrl="/teams/:slug/dashboard"
                afterSelectPersonalUrl="/me"
            />
        </AppPage>
    </AppPageContainer>
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /account/organization-list
 */

import { OrganizationList } from '@clerk/nextjs'

import { AppPage } from '@/components/app-page'


export default function OrganizationListPage() {
    return <AppPage variant="centered" label="Organization List">
        <OrganizationList/>
    </AppPage>
}
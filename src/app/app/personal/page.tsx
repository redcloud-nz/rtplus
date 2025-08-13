/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /account
 */

import { AppPage, AppPageBreadcrumbs } from '@/components/app-page'
import { NotImplemented } from '@/components/nav/errors'

export default async function SettingsPage() {
    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={["Personal"]}/>
        <NotImplemented/>
    </AppPage>
}
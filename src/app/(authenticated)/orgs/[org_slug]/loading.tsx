/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]
 */

import { AppPageHeader } from '@/components/app-page'
import { PageLoadingSpinner } from '@/components/ui/loading'
import { SidebarInset } from '@/components/ui/sidebar'

export default function Organization_Loading() {

    return <SidebarInset>
        <AppPageHeader/>
        <PageLoadingSpinner message="Loading..."/>
    </SidebarInset>
}
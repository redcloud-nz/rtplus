/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system
 */

import { LoaderIcon } from 'lucide-react'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'


export default function Loading() {

    return <AppPage>
        <AppPageBreadcrumbs label="Loading"/>
        <AppPageContent variant="centered">
            <div>
                <LoaderIcon className="animate-spin size-20"/>
            </div>
        </AppPageContent>
    </AppPage>
}
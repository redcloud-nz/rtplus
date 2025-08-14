/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { LoadingSpinner } from '@/components/ui/loading'
import * as Paths from '@/paths'

export const metadata: Metadata = { title: "System" }

export default async function System_Loading() {

    return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[
                    Paths.system,
                ]}
            />
                
                 <AppPageContent variant="centered">
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <LoadingSpinner className="w-32 h-32"/>
                        <div className="p-4">Aquiring parts.</div>
                    </div>
                </AppPageContent>
           
        </AppPage>
}
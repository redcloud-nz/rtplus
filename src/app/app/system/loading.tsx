/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system
 */

import { Metadata } from 'next'
import React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import * as Paths from '@/paths'

import { prefetch, trpc } from '@/trpc/server'
import { LoadingSpinner } from '@/components/ui/loading'

export const metadata: Metadata = { title: "Teams" }

export default async function TeamsPage() { 
    prefetch(trpc.teams.all.queryOptions())

    return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[
                    Paths.system,
                ]}
            />
                 <AppPageContent variant="centered">
                    <LoadingSpinner/>
                </AppPageContent>
           
        </AppPage>
}
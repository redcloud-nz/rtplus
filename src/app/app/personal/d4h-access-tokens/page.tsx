/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/personal/d4h-access-tokens
 */

import { Metadata } from 'next'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'

import * as Paths from '@/paths'

import { AccessTokenListCard } from './access-token-list'


export const metadata: Metadata = { title: "D4H Access Tokens - Personal" }

export default async function D4hAccessTokensPage() {

    return <AppPage>
        <AppPageBreadcrumbs breadcrumbs={[
            Paths.personal,
            Paths.personal.d4hAccessTokens
        ]}/>
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>My D4H Access Tokens</PageTitle>
            </PageHeader>
            <Boundary>
                <AccessTokenListCard/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}

 



/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /personal/d4h-access-tokens
 */

import { PlusIcon } from 'lucide-react'
import { Metadata } from 'next'
import * as React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageDescription, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Button } from '@/components/ui/button'

import * as Paths from '@/paths'

import { AccessTokenListCard } from './access-token-list'
import { AddAccessTokenDialog } from './add-access-token'




export const metadata: Metadata = { title: "My D4H Access Tokens" }

export default async function D4hAccessTokensPage() {

    return <AppPage>
        <AppPageBreadcrumbs
            label="D4H Access Tokens" 
            breadcrumbs={[{ label: "Personal", href: Paths.personal.index }]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>My D4H Access Tokens</PageTitle>
                {/* <PageControls>
                    <AddAccessTokenDialog>
                        <Button><PlusIcon/>Add</Button>
                    </AddAccessTokenDialog>
                </PageControls> */}
            </PageHeader>
            <Boundary>
                <AccessTokenListCard/>
            </Boundary>
            
        </AppPageContent>
    </AppPage>
}

 



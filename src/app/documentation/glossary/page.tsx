/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /documentation/glossary
 */
'use client'

import * as React from 'react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageHeader, PageTitle } from '@/components/app-page'

import * as Paths from '@/paths'

import { Terms } from './terms'

import { Alert } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { ExternalLink } from '@/components/ui/link'


export default function Glossary() {

    const [search, setSearch] = React.useState<string>("")
    
    return <AppPage>
        <AppPageBreadcrumbs
            label="Glossary"
            breadcrumbs={[{ label: "Documentation", href: Paths.documentation.index }]}
        />
        <AppPageContent>
            <PageHeader>
                <PageTitle>Glossary of Terms</PageTitle>
            </PageHeader>

            <div className="container max-w-4xl">
                <Alert severity="warning" className="my-4" title="Quality Warning">
                    These definitions were partly written by <ExternalLink href="https://github.com/features/copilot">GitHub Copilot</ExternalLink> and so their quality and relevence is not quaranteed.
                </Alert>
                <div  className="my-4">
                    <Input 
                        type="text" 
                        placeholder="Search glossary..."
                        value={search}
                        onChange={ev => setSearch(ev.target.value)}
                    />
                </div>
                <Terms query={search} />
            </div>
        </AppPageContent>
    </AppPage>
}


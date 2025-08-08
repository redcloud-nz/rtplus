/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/skill-packages
 */

import { ImportIcon } from 'lucide-react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'

import { SkillPackageListCard } from './skill-package-list'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'


export const metadata = { title: "Skill Packages" }

export default async function SkillPackageListPage() {

    prefetch(trpc.skills.getPackages.queryOptions({ status: ['Active', 'Inactive'] }))

    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[
                Paths.system, 
                Paths.system.skillPackages,
            ]}
        />
        <HydrateClient>
            <AppPageContent variant="container">
                <PageHeader>
                    <PageTitle>Skill Packages</PageTitle>
                    <PageControls>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={Paths.system.skillPackages.import}>
                                <ImportIcon/>
                            </Link>
                        </Button>
                    </PageControls>
                </PageHeader>

                <Boundary>
                     <SkillPackageListCard/>
                </Boundary>
            </AppPageContent>
        </HydrateClient>
        
    </AppPage>
}
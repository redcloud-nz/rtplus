/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages
 */

import { ImportIcon } from 'lucide-react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'

import { System_SkillPackagesList_Card } from './skill-package-list'


export const dynamic = 'force-dynamic'

export const metadata = { title: "Skill Packages" }

export default async function System_SkillPackagesList_Page() {

    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[
                Paths.system, 
                Paths.system.skillPackages,
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skill Packages</PageTitle>
                <PageControls>
                    <Button variant="ghost" size="icon" asChild>
                        <Link to={Paths.system.skillPackages.import}>
                            <ImportIcon/>
                        </Link>
                    </Button>
                </PageControls>
            </PageHeader>

            <Boundary>
                <System_SkillPackagesList_Card/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
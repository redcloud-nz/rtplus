/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /system/skill-packages
 */

import { ImportIcon } from 'lucide-react'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'

import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import prisma from '@/server/prisma'

import { SkillPackageListCard_sys } from './skill-package-list'


export const metadata = { title: "Skill Packages" }


export default async function SkillPackageListPage() {

    const skillPackages = await prisma.skillPackage.findMany({})

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
                        <Link href={Paths.system.skillPackages.import}>
                            <ImportIcon/>
                        </Link>
                    </Button>
                </PageControls>
            </PageHeader>
            <SkillPackageListCard_sys/>
        </AppPageContent>
    </AppPage>
}
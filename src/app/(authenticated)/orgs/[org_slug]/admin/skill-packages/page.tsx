/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin/skill-packages
 */

import { ImportIcon } from 'lucide-react'

import { Protect } from '@clerk/nextjs'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'

import { AdminModule_SkillPackagesList } from './skill-package-list'


export const metadata = { title: "Skill Packages" }

export default async function AdminModule_SkillPackagesList_Page(props: PageProps<'/orgs/[org_slug]/admin/skill-packages'>) {
    const { org_slug: orgSlug } = await props.params

    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[
                Paths.adminModule(orgSlug),
                Paths.adminModule(orgSlug).skillPackages,
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skill Packages</PageTitle>
                <PageControls>
                    <Protect role="org:admin">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to={Paths.adminModule(orgSlug).skillPackages.import}>
                                <ImportIcon/>
                            </Link>
                        </Button>
                    </Protect>
                    
                </PageControls>
            </PageHeader>

            <Boundary>
                <AdminModule_SkillPackagesList orgSlug={orgSlug}/>
            </Boundary>
        </AppPageContent>
    </AppPage>
}
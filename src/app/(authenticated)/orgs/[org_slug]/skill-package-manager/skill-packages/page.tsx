/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages
 */

import { ImportIcon } from 'lucide-react'

import { Protect } from '@clerk/nextjs'

import { AppPage, AppPageBreadcrumbs, AppPageContent, PageControls, PageHeader, PageTitle } from '@/components/app-page'
import { Boundary } from '@/components/boundary'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { AdminModule_SkillPackagesList } from './skill-package-list'



export const metadata = { title: "Skill Packages" }

export default async function AdminModule_SkillPackagesList_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <AppPage>
        <AppPageBreadcrumbs 
            breadcrumbs={[
                Paths.org(orgSlug).spm,
                Paths.org(orgSlug).spm.skillPackages,
            ]}
        />
        <AppPageContent variant="container">
            <PageHeader>
                <PageTitle>Skill Packages</PageTitle>
                <PageControls>
                    <Protect role="org:admin">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to={Paths.org(orgSlug).spm.skillPackages.import}>
                                <ImportIcon/>
                            </Link>
                        </Button>
                    </Protect>
                    
                </PageControls>
            </PageHeader>

            <Boundary>
                <AdminModule_SkillPackagesList organization={organization} />
            </Boundary>
        </AppPageContent>
    </AppPage>
}
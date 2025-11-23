/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages/--create
 */

import { Metadata } from 'next'

import { Lexington } from '@/components/blocks/lexington'
import { ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { AdminModile_CreateSkillPackage_Form } from './new-skill-package'


export const metadata: Metadata = {
    title: 'Create Skill Package'
}

export default async function AdminModile_CreateSkillPackage_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/--create'>) {
    const { org_slug: orgSlug } = await props.params
    const organisation = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).skillPackageManager,
                Paths.org(orgSlug).skillPackageManager.skillPackages,
                Paths.org(orgSlug).skillPackageManager.skillPackages.create
            ]}
        />
        <Lexington.Page>
           <Lexington.Column width="lg">
                <Lexington.ColumnControls>
                    <S2_Button variant="outline" asChild>
                        <Link to={Paths.org(orgSlug).skillPackageManager.skillPackages}>
                            <ToParentPageIcon/> Skill Packages List
                        </Link>
                    </S2_Button>
                </Lexington.ColumnControls>
                <AdminModile_CreateSkillPackage_Form organization={organisation} />
           </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
 }
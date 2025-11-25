/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skill-package-manager/skill-packages/--create
 */

import { Metadata } from 'next'

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { SkillPackageManagerModule_CreatePackage_Form } from './create-skill-package'



export const metadata: Metadata = {
    title: 'Create Skill Package'
}

export default async function SkillPackageManagerModule_CreatePackage_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/--create'>) {
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
                <Hermes.Section>
                    <Hermes.SectionHeader>
                        <Hermes.BackButton to={Paths.org(orgSlug).skillPackageManager.skillPackages}>
                            Skill Packages
                        </Hermes.BackButton>
                    </Hermes.SectionHeader>

                    <SkillPackageManagerModule_CreatePackage_Form organization={organisation} />
                </Hermes.Section>
           </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
 }
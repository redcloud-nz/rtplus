/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/skills/create
 */


import { notFound } from 'next/navigation'

import { Hermes } from '@/components/blocks/hermes'
import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { getSkillPackage } from '@/server/skills'

import { SkillPackageModule_CreateSkill_Form } from './create-skill'


export default async function SkillPackageModule_CreateSkill_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager/skill-packages/[skill_package_id]/skills/[skill_id]'>) {
    const { org_slug: orgSlug, skill_package_id: skillPackageId } = await props.params
    const organization = await getOrganization(orgSlug)
    const skillPackage = await getSkillPackage(organization.orgId, skillPackageId)
    if(!skillPackage) notFound()

    return <Lexington.Column width="lg">

        <Hermes.Section>
            <Hermes.SectionHeader>
                <Hermes.BackButton to={Paths.org(organization.slug).skillPackageManager.skillPackage(skillPackage.skillPackageId)}>
                    {skillPackage.name}
                </Hermes.BackButton>
            </Hermes.SectionHeader>
        </Hermes.Section>
        <SkillPackageModule_CreateSkill_Form 
            organization={organization} 
            skillPackageId={skillPackage.skillPackageId}
        />
    </Lexington.Column>
}

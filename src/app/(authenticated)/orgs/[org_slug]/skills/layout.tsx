/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skills
 */

import { ModuleNotEnabled } from '@/components/nav/errors'
import { isModuleEnabled } from '@/lib/modules'
import { getOrganization } from '@/server/organization'

export default async function SkillsModule_Layout(props: LayoutProps<'/orgs/[org_slug]/skills'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    if(isModuleEnabled(organization, 'skills')) {
        return <>{props.children}</>
    } else {
        return <ModuleNotEnabled moduleName="skills"/>
    }
}
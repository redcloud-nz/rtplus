/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skill-package-manager
 */

import { ModuleNotAvailable } from '@/components/nav/errors'
import { isModuleEnabled } from '@/lib/schemas/organization'
import { getOrganization } from '@/server/organization'

export default async function Organization_SkillPackageManager_Layout(props: LayoutProps<'/orgs/[org_slug]/skill-package-manager'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    if(isModuleEnabled(organization, 'spm')) {
        return <>{props.children}</>
    } else {
        return <ModuleNotAvailable moduleName="skill-package-manager"/>
    }
}
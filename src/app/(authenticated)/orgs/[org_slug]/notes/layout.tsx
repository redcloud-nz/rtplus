/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/notes
 */

import { ModuleNotEnabled } from '@/components/nav/errors'
import { isModuleEnabled } from '@/lib/modules'
import { getOrganization } from '@/server/organization'

export default async function NotesModule_Layout(props: LayoutProps<'/orgs/[org_slug]/notes'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    if(isModuleEnabled(organization, 'notes')) {
        return <>{props.children}</>
    } else {
        return <ModuleNotEnabled moduleName="notes"/>
    }
}
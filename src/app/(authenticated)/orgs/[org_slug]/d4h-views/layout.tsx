/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/d4h-views
 */

import { ModuleNotEnabled } from '@/components/nav/errors'
import { d4hViewsModuleFlag } from '@/lib/flags'
import { isModuleEnabled } from '@/lib/modules'
import { getOrganization } from '@/server/organization'


export const metadata = { title: 'D4H Views' }

export default async function D4hViewsModule_Layout(props: LayoutProps<'/orgs/[org_slug]/d4h-views'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    const d4hViewsModuleAllowed = await d4hViewsModuleFlag()

    if(d4hViewsModuleAllowed && isModuleEnabled(organization, 'd4h-views')) {
        return <>{props.children}</>
    } else {
        return <ModuleNotEnabled moduleName="d4h-views"/>
    }
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]
 */

import { Metadata } from 'next'

import { AppSidebar } from '@/components/nav/app-sidebar'
import { OrganizationProvider } from '@/hooks/use-organization'
import { getOrganization } from '@/server/organization'
import { NavOrganizationMenu } from '@/components/nav/nav-organization-menu'


export async function generateMetadata(props: LayoutProps<'/orgs/[org_slug]'>): Promise<Metadata> {
    const { org_slug } = await props.params
    const organization = await getOrganization(org_slug)

    return {
        title: {
            template: `%s - ${organization.name} | RT+`,
            default: "RT+"
        },
        description: "RT+ Application",
    }
}

export default async function Organization_Layout(props: LayoutProps<'/orgs/[org_slug]'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <OrganizationProvider initial={organization}>
        <AppSidebar name={organization.name}>
            <NavOrganizationMenu/>
        </AppSidebar>
        {props.children}
    </OrganizationProvider>
}
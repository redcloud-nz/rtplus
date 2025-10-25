/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]
 */

import { ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Show } from '@/components/show'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/items'
import { Link } from '@/components/ui/link'

import { isModuleEnabled } from '@/lib/schemas/organization'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'




export const metadata = { title: 'Dashboard' }

export default async function OrganizationDashboard_Page(props: PageProps<'/orgs/[org_slug]'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={["Dashboard"]}
            />
            <AppPageContent variant="container">
               
                <div className="flex flex-col items-center gap-4 my-4">
                    <Image
                        className="dark:invert"
                        src="/logo.svg"
                        alt="RT+ logo"
                        width={200}
                        height={100}
                        priority
                    />
                    <p>Response Team Management Tools.</p>
                </div>
                <div className="flex w-full max-w-md flex-col gap-4">
                    <Item asChild>
                        <Link to={Paths.org(orgSlug).admin}>
                            <ItemContent>
                                <ItemTitle>Admin</ItemTitle>
                                <ItemDescription>Manage personnel, teams, and organization settings.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ChevronRightIcon className="size-4" />
                            </ItemActions>
                        </Link>
                    </Item>
                    <Show when={isModuleEnabled(organization, 'd4h')}>
                        <Item asChild>
                            <Link to={Paths.org(orgSlug).d4h}>
                                <ItemContent>
                                    <ItemTitle>D4H</ItemTitle>
                                    <ItemDescription>Alternate views of the data stored in D4H Team Manager.</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <ChevronRightIcon className="size-4" />
                                </ItemActions>
                            </Link>
                        </Item>
                    </Show>
                    <Show when={isModuleEnabled(organization, 'skills')}>
                        <Item asChild>
                            <Link to={Paths.org(orgSlug).skills}>
                                <ItemContent>
                                    <ItemTitle>Skills</ItemTitle>
                                    <ItemDescription>Manage, assess, and report skills for your team.</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <ChevronRightIcon className="size-4" />
                                </ItemActions>
                            </Link>
                        </Item>
                    </Show>
                </div>
            </AppPageContent>
        </AppPage>
}
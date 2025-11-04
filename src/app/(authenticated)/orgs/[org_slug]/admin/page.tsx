/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/admin
 */

import { ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'

import { Lexington } from '@/components/blocks/lexington'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/items'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'
import { Protect } from '@clerk/nextjs'



export const metadata = { title: 'Admin Dashboard' }

export default async function AdminModule_Index_Page(props: PageProps<'/orgs/[org_slug]/admin'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.org(orgSlug).admin
            ]}
        />
        <Lexington.Page variant="container-sm">
            
            <div className="flex flex-col items-center gap-4 my-4">
                <Image
                    className="dark:invert"
                    src="/logo.svg"
                    alt="RT+ logo"
                    width={200}
                    height={100}
                    priority
                />
                <div className="font-semibold mt-4">Admin Module</div>
            </div>
            <ItemGroup>
                <Protect role="org_admin">
                    <Item asChild>
                        <Link to={Paths.org(orgSlug).admin.profile}>
                            <ItemContent>
                                <ItemTitle>Organization</ItemTitle>
                                <ItemDescription>Manage your organization's profile, members, and invitations.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ChevronRightIcon className="size-4" />
                            </ItemActions>
                        </Link>
                    </Item>
                </Protect>
                
                <Item asChild>
                    <Link to={Paths.org(orgSlug).admin.personnel}>
                        <ItemContent>
                            <ItemTitle>Personnel</ItemTitle>
                            <ItemDescription>Manage your organization's personnel.</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <ChevronRightIcon className="size-4" />
                        </ItemActions>
                    </Link>
                </Item>
                <Item asChild>
                    <Link to={Paths.org(orgSlug).admin.settings}>
                        <ItemContent>
                            <ItemTitle>Settings</ItemTitle>
                            <ItemDescription>Manage your organization's settings.</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <ChevronRightIcon className="size-4" />
                        </ItemActions>
                    </Link>
                </Item>
                {/* <Show when={isModuleEnabled(organization, 'skills')}>
                    <Item asChild>
                        <Link to={Paths.org(orgSlug).admin.skillPackages}>
                            <ItemContent>
                                <ItemTitle>Skill Packages</ItemTitle>
                                <ItemDescription>Manage the skill-packages owned by your organisation.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ChevronRightIcon className="size-4" />
                            </ItemActions>
                        </Link>
                    </Item>
                </Show> */}
                <Item asChild>
                    <Link to={Paths.org(orgSlug).admin.teams}>
                        <ItemContent>
                            <ItemTitle>Teams</ItemTitle>
                            <ItemDescription>Manage your organisation's teams.</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <ChevronRightIcon className="size-4" />
                        </ItemActions>
                    </Link>
                </Item>
            </ItemGroup>
        </Lexington.Page>
    </Lexington.Root>
}
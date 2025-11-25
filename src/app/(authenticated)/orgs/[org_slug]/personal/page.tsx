/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/personal
 */

import { ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/items'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'
import { Lexington } from '@/components/blocks/lexington'

export const metadata = { title: 'Dashboard' }

export default async function PersonalDashboardPage(props: PageProps<'/orgs/[org_slug]/personal'>) {
    const { org_slug: orgSlug } = await props.params

    return <Lexington.Root>
            <Lexington.Header
                breadcrumbs={["Dashboard"]}
            />
            <Lexington.Page>
                <Lexington.Column width="md">
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
                            <Link to={Paths.org(orgSlug).personal.profile}>
                                <ItemContent>
                                    <ItemTitle>Profile</ItemTitle>
                                    <ItemDescription>Manage your personal profile settings.</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <ChevronRightIcon className="size-4" />
                                </ItemActions>
                            </Link>
                        </Item>
                        <Item asChild>
                            <Link to={Paths.org(orgSlug).personal.settings}>
                                <ItemContent>
                                    <ItemTitle>Settings</ItemTitle>
                                    <ItemDescription>Manage your personal settings.</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <ChevronRightIcon className="size-4" />
                                </ItemActions>
                            </Link>
                        </Item>
                        <Item asChild>
                            <Link to={Paths.org(orgSlug).personal.d4hAccessTokens}>
                                <ItemContent>
                                    <ItemTitle>D4H Access Tokens</ItemTitle>
                                    <ItemDescription>Manage your D4H access tokens.</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <ChevronRightIcon className="size-4" />
                                </ItemActions>
                            </Link>
                        </Item>
                    </div>

                </Lexington.Column>
               
                
            </Lexington.Page>
        </Lexington.Root>
}
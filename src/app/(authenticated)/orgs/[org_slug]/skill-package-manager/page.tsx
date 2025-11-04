/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/skill-package-manager
 */

import { ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/items'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'

export const metadata = { title: 'Skill Package Manager' }

export default async function OrganizationDashboard_Page(props: PageProps<'/orgs/[org_slug]/skill-package-manager'>) {
    const { org_slug: orgSlug } = await props.params

    return <AppPage>
            <AppPageBreadcrumbs
                breadcrumbs={[
                    Paths.org(orgSlug).spm,
                ]}
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
                    <div className="font-semibold mt-4">Skill Package Manager Module</div>
                </div>
                <div className="flex w-full max-w-md flex-col gap-4">
                    <Item asChild>
                        <Link to={Paths.org(orgSlug).spm.skillPackages}>
                            <ItemContent>
                                <ItemTitle>Skill Packages</ItemTitle>
                                <ItemDescription>Manage skill packages and their contents.</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <ChevronRightIcon className="size-4" />
                            </ItemActions>
                        </Link>
                    </Item>
                </div>
            </AppPageContent>
        </AppPage>
}
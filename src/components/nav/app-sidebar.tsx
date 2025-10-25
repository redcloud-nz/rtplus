/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import Image from 'next/image'
import { Suspense } from 'react'

import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'

import { NavOrganizationMenu } from './nav-organization-menu'
import { NavSkeleton } from './nav-skeleton'


export function AppSidebar() {
    return <Sidebar>
        <SidebarHeader className="flex items-center justify-between">
            <div className="px-2">
                <Image
                    src="/logo.svg"
                    alt="RT+ logo"
                    width={48}
                    height={24}
                    priority
                />
            </div>
            <div className="flex items-center gap-2 p-2">
                <UserButton/>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <div className="h-10 flex items-center">
                <OrganizationSwitcher
                    appearance={{
                        elements: {
                            organizationSwitcherTrigger: 'w-[var(--sidebar-internal-width)] py-2',
                        }
                    }}
                    hidePersonal
                    afterCreateOrganizationUrl="/orgs/:slug"
                    afterSelectOrganizationUrl="/orgs/:slug"
                />
            </div>
            <SidebarGroup>
                <SidebarGroupLabel>Organization</SidebarGroupLabel>
                <Suspense fallback={<NavSkeleton/>}>
                    <NavOrganizationMenu/>
                </Suspense>
            </SidebarGroup>
            
        </SidebarContent>
        <SidebarFooter>
            <AppVersion/>
        </SidebarFooter>
        <SidebarRail side="left" />
    </Sidebar>
}

function AppVersion() {
    return <div className="text-xs text-center text-muted-foreground py-1">
        RT+ v{process.env.NEXT_PUBLIC_APP_VERSION} ({process.env.NEXT_PUBLIC_APP_VERSION_NAME})
    </div>
}
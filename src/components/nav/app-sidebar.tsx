/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import Image from 'next/image'
import { Suspense } from 'react'

import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'

import { S2_Sidebar, S2_SidebarContent, S2_SidebarFooter, S2_SidebarGroup, S2_SidebarGroupLabel, S2_SidebarHeader, S2_SidebarRail } from '@/components/ui/s2-sidebar'

import { NavOrganizationMenu } from './nav-organization-menu'
import { NavSkeleton } from './nav-skeleton'


export function AppSidebar() {
    return <S2_Sidebar>
        <S2_SidebarHeader className="flex items-center justify-between">
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
        </S2_SidebarHeader>
        <S2_SidebarContent>
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
            <S2_SidebarGroup>
                <S2_SidebarGroupLabel>Organization</S2_SidebarGroupLabel>
                <Suspense fallback={<NavSkeleton/>}>
                    <NavOrganizationMenu/>
                </Suspense>
            </S2_SidebarGroup>
            
        </S2_SidebarContent>
        <S2_SidebarFooter>
            <AppVersion/>
        </S2_SidebarFooter>
        <S2_SidebarRail/>
    </S2_Sidebar>
}

function AppVersion() {
    return <div className="text-xs text-center text-muted-foreground py-1">
        RT+ v{process.env.NEXT_PUBLIC_APP_VERSION} ({process.env.NEXT_PUBLIC_APP_VERSION_NAME})
    </div>
}
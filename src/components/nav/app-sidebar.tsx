/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import Image from 'next/image'
import Link from 'next/link'
import type { ComponentProps } from 'react'

import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import * as Paths from '@/paths'

export async function AppSidebar({ children, moduleName, ...props }: Omit<ComponentProps<typeof Sidebar>, 'side'> & { moduleName?: string }) {
    return <Sidebar {...props}>
        <SidebarHeader className="flex items-center justify-between">
            <Link href={Paths.dashboard.href} className="h-full flex items-center p-2 gap-1 italic text-gray-600">
                <Image
                    src="/logo.svg"
                    alt="RT+ logo"
                    width={48}
                    height={24}
                    priority
                />
                { moduleName && <div className="text-xl pt-1">{moduleName}</div> }
            </Link>
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
                />
            </div>
            
            {children}
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
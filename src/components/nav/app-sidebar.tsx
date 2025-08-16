/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import Image from 'next/image'
import Link from 'next/link'
import type { ComponentProps } from 'react'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import * as Paths from '@/paths'

import { NavUser } from './nav-user'


export async function AppSidebar({ children, ...props }: Omit<ComponentProps<typeof Sidebar>, 'side'>) {
    return <Sidebar {...props}>
        <SidebarHeader className="flex items-center justify-center">
            <Link href={Paths.selectTeam.href}>
                <Image
                    className="dark:invert"
                    src="/logo.svg"
                    alt="RT+ logo"
                    width={64}
                    height={32}
                    priority
                />
            </Link>
        </SidebarHeader>
        <SidebarContent>
            {children}
        </SidebarContent>
        <SidebarFooter>
            <AppVersion/>
            <NavUser/>
        </SidebarFooter>
        <SidebarRail side="left" />
    </Sidebar>
}

function AppVersion() {
    return <div className="text-xs text-center text-muted-foreground">
        RT+ v{process.env.NEXT_PUBLIC_APP_VERSION} ({process.env.NEXT_PUBLIC_APP_VERSION_NAME})
    </div>
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { BookOpenIcon, InfoIcon} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'


import { NavItem, NavSection } from '@/components/nav-section'

import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'

export type AppSidebarProps = React.ComponentProps<typeof Sidebar>

export function AppSidebar({ children, ...props }: AppSidebarProps) {
    return <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="mt-2">
            <Link href="/">
                <Image
                    className="dark:invert"
                    src="/logo.svg"
                    alt="RT+ logo"
                    width={150}
                    height={75}
                    priority
                />
            </Link>
        </SidebarHeader>
        <SidebarContent>
            {children}
            <NavSection title="General">
                <NavItem label="About" href="/about" icon={<InfoIcon/>}/>
                <NavItem label="Documentation" href="/documentation" icon={<BookOpenIcon/>}/>
                <NavItem label="Source Code" href="https://github.com/redcloud-nz/rtplus" icon={<Image aria-hidden src="/github.svg" alt="Githib Icon" width={16} height={16}/>}/>
            </NavSection>
        </SidebarContent>
        <SidebarRail />
    </Sidebar>
}

/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /unified
 */

import { CalendarDaysIcon, UsersIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { AppPageContainer } from '@/components/app-page'
import { AppSidebar } from "@/components/app-sidebar"
import { NavItem, NavSection } from '@/components/nav-section'

import * as Paths from '@/paths'


export const metadata: Metadata = {
    title: "RT+ | D4H Unified",
    description: "Alternate views of the data stored in D4H Team Manager. Unified across multiple teams",
};

export default async function D4HUnifiedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>
        <AppSidebar>
            <NavSection title="D4H Unified">
                <NavItem label="Personnel" href={Paths.unified.personnel} icon={<UsersIcon/>}/>

                <NavItem label="Calendar" href={Paths.unified.calendar} icon={<CalendarDaysIcon/>}/>
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {children}
        </AppPageContainer>
    </>
}

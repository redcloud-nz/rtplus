/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies
 */

import { BadgeCheckIcon, KeyRoundIcon, ShieldQuestionIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { AppPageContainer } from '@/components/app-page'
import { AppSidebar } from "@/components/app-sidebar"
import { NavItem, NavSection } from '@/components/nav-section'

import * as Paths from '@/paths'


export const metadata: Metadata = {
    title: {
        template: "%s | My Account | RT+",
        default: "My Account | RT+",
    },
    description: "RT+ Account Management",
};

export default async function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>
        <AppSidebar>
            <NavSection title="My Account">
                <NavItem label="Profile" href={Paths.account.profile} icon={<BadgeCheckIcon/>}/>
                <NavItem label="D4H Access Keys" href={Paths.account.d4hAccessKeys} icon={<KeyRoundIcon/>}/>
                <NavItem label="Who am I?" href={Paths.account.whoami} icon={<ShieldQuestionIcon/>}/>
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {children}
        </AppPageContainer>
    </>
}

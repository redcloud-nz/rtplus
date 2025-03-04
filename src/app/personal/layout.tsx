/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /personal
 */

import { BadgeCheckIcon, KeyRoundIcon, ShieldQuestionIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { AppPageContainer } from '@/components/app-page'
import { AppSidebar } from "@/components/app-sidebar"
import { NavItem, NavSection } from '@/components/nav-section'

import * as Paths from '@/paths'


export const metadata: Metadata = {
    title: {
        template: "%s | Personal | RT+",
        default: "Personal",
    },
    description: "Personal account settings and information.",
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
    return <>
        <AppSidebar>
            <NavSection title="My Account">
                <NavItem label="Profile" href={Paths.personal.userProfile} icon={<BadgeCheckIcon/>}/>
                <NavItem label="D4H Access Tokens" href={Paths.personal.d4hAccessTokens} icon={<KeyRoundIcon/>}/>
                <NavItem label="Who am I?" href={Paths.personal.whoami} icon={<ShieldQuestionIcon/>}/>
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {children}
        </AppPageContainer>
    </>
}

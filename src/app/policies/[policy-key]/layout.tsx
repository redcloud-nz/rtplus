/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /policies/[policy-key]
 */

import { AppSidebar } from '@/components/app-sidebar'
import { NavItem, NavSection } from '@/components/nav-section'

import * as Paths from '@/paths'
import { AppPageContainer } from '@/components/app-page'


export default async function PolicyLayout({ children }: { children: React.ReactNode }) {
    return <>
        <AppSidebar>
            <NavSection title="Policies">
               <NavItem label="Privacy" href={Paths.policies.policy('terms-of-use')} />
               <NavItem label="Terms of use" href={Paths.policies.policy('privacy')} />
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {children}
        </AppPageContainer>
    </>
}

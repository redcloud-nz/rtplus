/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /competencies
 */

import { CarIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { AppPageContainer } from '@/components/app-page'
import { AppSidebar } from "@/components/app-sidebar"
import { NavItem, NavSection} from '@/components/nav-section'


export const metadata: Metadata = {
    title: "RT+ | Reference Cards",
    description: "RT+ Reference Cards",
};

export default async function ReferenceCardsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>
        <AppSidebar>
            <NavSection title="Reference Cards">
                <NavItem label="Vehicles" href="/cards/vehicles" icon={<CarIcon/>}/>
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {children}
        </AppPageContainer>
    </>
}

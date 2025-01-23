/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /documentation
 */

import { BookTextIcon, PocketKnifeIcon } from 'lucide-react'
import type { Metadata } from 'next'

import { AppPageContainer } from '@/components/app-page'

import { NavItem, NavSection } from '@/components/nav-section'
import { AppSidebar } from '@/components/app-sidebar'

import * as Paths from '@/paths'


export const metadata: Metadata = {
    title: "RT+ Competencies",
    description: "RT+ Competency management and tracking",
};

export default async function DocuemntationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>
        <AppSidebar>
            <NavSection title="Documentation">
                <NavItem label="Competencies" href={Paths.documentation.competencies} icon={<PocketKnifeIcon/>}/>
                <NavItem label='Glossary' href={Paths.documentation.glossary} icon={<BookTextIcon/>}/>
            </NavSection>
        </AppSidebar>
        <AppPageContainer hasSidebar>
            {children}
        </AppPageContainer>
    </>
}

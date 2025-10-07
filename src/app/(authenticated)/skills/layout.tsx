/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /skills
 */

import { Metadata } from 'next'
import { ReactNode } from 'react'

import { AppSidebar } from '@/components/nav/app-sidebar'
import { NavItem, NavSection } from '@/components/nav/nav-section'

import * as Paths from '@/paths'

export const metadata: Metadata = {
    title: {
        template: `%s | RT+ Skills`,
        default: "Skills"
    },
    description: "RT+ Skills Module",
}


export default async function SkillsModule_Layout(props: { children: ReactNode }) {

    return <>
        <AppSidebar moduleName="Skills">
            <NavSection>
                <NavItem path={Paths.skills.catalogue}/>
                <NavItem path={Paths.skills.checks}/>
                <NavItem path={Paths.skills.sessions}/>
                <NavItem path={Paths.skills.reports}/>
            </NavSection>
        </AppSidebar>
        {props.children}
    </>
}
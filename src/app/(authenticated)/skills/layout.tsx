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
                <NavItem path={Paths.skillsModule.catalogue}/>
                <NavItem path={Paths.skillsModule.checks}/>
                <NavItem path={Paths.skillsModule.sessions}/>
                <NavItem path={Paths.skillsModule.reports}/>
            </NavSection>
        </AppSidebar>
        {props.children}
    </>
}
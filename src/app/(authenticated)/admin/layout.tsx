/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /admin
 */

import { Metadata } from 'next'
import { ReactNode } from 'react'

import { AppSidebar } from '@/components/nav/app-sidebar'
import { NavItem, NavSection } from '@/components/nav/nav-section'

import * as Paths from '@/paths'

export const metadata: Metadata = {
    title: {
        template: `%s | RT+ Admin`,
        default: "Admin"
    },
    description: "RT+ Admin Module",
}


export default async function AdminModule_Layout(props: { children: ReactNode }) {

    return <>
        <AppSidebar moduleName="Admin">
            <NavSection>
                <NavItem path={Paths.admin.personnel}/>
                <NavItem path={Paths.admin.teams}/>
            </NavSection>
        </AppSidebar>
        {props.children}
    </>
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /d4h
 */

import { Metadata } from 'next'
import { ReactNode } from 'react'

import { AppSidebar } from '@/components/nav/app-sidebar'
import { NavItem, NavSection } from '@/components/nav/nav-section'

import * as Paths from '@/paths'

export const metadata: Metadata = {
    title: {
        template: `%s | RT+ D4H`,
        default: "D4H"
    },
    description: "RT+ D4H Module",
}


export default async function D4HModule_Layout(props: { children: ReactNode }) {

    return <>
        <AppSidebar moduleName="D4H">
            <NavSection>
                <NavItem path={Paths.d4h.activities}/>
                <NavItem path={Paths.d4h.calendar}/>
                <NavItem path={Paths.d4h.equipment}/>
                <NavItem path={Paths.d4h.personnel}/>
            </NavSection>
        </AppSidebar>
        {props.children}
    </>
}
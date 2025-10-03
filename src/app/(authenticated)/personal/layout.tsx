/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /system
 */

import { Metadata } from 'next'
import { ReactNode } from 'react'

import { AppSidebar } from '@/components/nav/app-sidebar'
import { NavItem, NavSection } from '@/components/nav/nav-section'
import { NavTeamSection } from '@/components/nav/nav-team-section'
import { Separator } from '@/components/ui/separator'

import * as Paths from '@/paths'

export const metadata: Metadata = {
    applicationName: "RT+",
    title: {
        template: `%s - Personal | RT+`,
        default: "Personal",
    },
    description: "RT+ App",

}

export default async function Personal_Layout(props: { children: ReactNode }) {

    return <>
        <AppSidebar>
            <NavTeamSection/>
            <Separator orientation='horizontal'/>
            <NavSection title="Personal">
                <NavItem path={Paths.personal.account}/>
                <NavItem path={Paths.personal.d4hAccessTokens}/>
            </NavSection>
        </AppSidebar>
        {props.children}
    </>
}
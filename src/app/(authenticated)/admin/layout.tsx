/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /admin
 */

import { Metadata } from 'next'
import { ReactNode } from 'react'
import { pick } from 'remeda'

import { AppSidebar } from '@/components/nav/app-sidebar'
import { NavItem, NavSection } from '@/components/nav/nav-section'

import * as Paths from '@/paths'
import { DashboardIcon, PersonnelIcon, SettingsIcon, SkillsIcon, TeamsIcon } from '@/components/icons'


export const metadata: Metadata = {
    title: {
        template: `%s | RT+ Admin`,
        default: "Admin"
    },
    description: "RT+ Admin Module",
}


export default async function AdminModule_Layout(props: { children: ReactNode }) {

    return <>
        <AppSidebar moduleName="admin">
            <NavSection>
                <NavItem path={pick(Paths.admin, ['href', 'label'])} label="Dashboard" icon={<DashboardIcon/>}/>
                <NavItem path={Paths.admin.personnel} icon={<PersonnelIcon/>}/>
                <NavItem path={Paths.admin.settings} icon={<SettingsIcon/>}/>
                <NavItem path={Paths.admin.skillPackages} icon={<SkillsIcon/>}/>
                <NavItem path={Paths.admin.teams} icon={<TeamsIcon/>}/>
            </NavSection>
        </AppSidebar>
        {props.children}
    </>
}
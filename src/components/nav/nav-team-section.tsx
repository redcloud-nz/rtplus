/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { BookOpenIcon, CableIcon, HammerIcon, PocketKnifeIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import Image from 'next/image'

import { Protect, useOrganization } from '@clerk/nextjs'

import { Skeleton } from '@/components/ui/skeleton'

import * as Paths from '@/paths'

import { NavCollapsible, NavItem, NavSection, NavSectionHeadingLink, NavSubItem } from './nav-section'
import { Show } from '../show'

/**
 * A nav section for team-related navigation items.
 */
export function NavTeamSection() {
    const { isLoaded, organization } = useOrganization()

    const slug = organization?.slug ?? ''
    const type = organization?.publicMetadata?.type
    const isSystem = type == 'System'
    const isTeam = type == 'Normal' || type == 'Sandbox'
    const isPersonal = organization == null

    return isLoaded
        ? <NavSection>
            <NavSectionHeadingLink
                to={isPersonal 
                    ? Paths.personal
                    : isSystem 
                        ? Paths.system
                        : Paths.team(slug)
                }
            >
                {isPersonal ? "Personal Account" : organization.name}
            </NavSectionHeadingLink>

            {/* <NavItem label="About" href="/about" icon={<InfoIcon/>}/> */}

            <Show when={isTeam}>
                <NavCollapsible label="Skills" icon={<PocketKnifeIcon/>}>
                    <NavSubItem path={Paths.team(slug).skills.catalogue}/>
                    <NavSubItem path={Paths.team(slug).skills.checks}/>
                    <NavSubItem path={Paths.team(slug).skills.sessions}/>
                    <NavSubItem path={Paths.team(slug).skills.reports}/>
                </NavCollapsible>
            </Show>

            <Show when={isTeam || isPersonal}>
                    <NavCollapsible label="D4H" icon={<CableIcon/>}>
                    <NavSubItem path={Paths.d4h.activities}/>
                    <NavSubItem path={Paths.d4h.calendar}/>
                    <NavSubItem path={Paths.d4h.equipment}/>
                    <NavSubItem path={Paths.d4h.personnel}/>
                </NavCollapsible>
            </Show>

            <NavItem external label="Documentation" href={`${process.env.NEXT_PUBLIC_APP_REPOSITORY_URL}/wiki`} icon={<BookOpenIcon/>}/>

            <Show when={isTeam}>
                <NavItem path={Paths.team(slug).members} icon={<UsersIcon/>}/> 
            </Show>

            <Show when={isSystem}>
                <NavItem path={Paths.system.personnel}/>
            </Show>

            <Show when={isSystem}>
                <NavItem path={Paths.system.skillPackages}/>
            </Show>

            <Show when={isSystem}>
                <NavCollapsible label="System Team">
                    <NavSubItem path={Paths.team('system').invitations}/>
                    <NavSubItem path={Paths.team('system').users}/>
                </NavCollapsible>
            </Show>

            <NavItem external label="Source Code" href={`${process.env.NEXT_PUBLIC_APP_REPOSITORY_URL}`} icon={<Image aria-hidden src="/github.svg" alt="Githib Icon" width={16} height={16}/>}/>

            <Show when={isTeam}>
                <Protect role="org:admin">
                    <NavCollapsible label="Team Admin" icon={<SettingsIcon/>}>
                        <NavSubItem path={Paths.team(slug).invitations}/>
                        <NavSubItem path={Paths.team(slug).users}/>
                    </NavCollapsible>
                </Protect>
            </Show>
            <NavCollapsible label="Tools" icon={<HammerIcon/>}>
                <NavSubItem path={Paths.tools.skillRecorder.sessions}/>
            </NavCollapsible>
            <Show when={isSystem}>
                <NavItem path={Paths.system.teams}/>
            </Show>
            
        </NavSection>
        : <Skeleton className="w-full h-32 mb-2 [&_[data-slot=spinner]]:w-10 [&_[data-slot=spinner]]:h-10" variant="spinner"/>

}

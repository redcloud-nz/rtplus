/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { BookOpenIcon, CableIcon, HammerIcon, PocketKnifeIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import Image from 'next/image'

import { Protect, useOrganization } from '@clerk/nextjs'

import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Skeleton } from '@/components/ui/skeleton'

import * as Paths from '@/paths'

import { NavCollapsible, NavItem, NavSection, NavSubItem } from './nav-section'
import { Show } from '../show'

export function NavTeamSection() {

    const { isLoaded, organization } = useOrganization()

    const slug = organization?.slug ?? ''
    const isSystem = slug == 'system'
    const isTeam = slug.length > 0 && !isSystem
    const isPersonal = organization == null

    return isLoaded
        ? <NavSection>
            <Button variant="ghost" className="w-full h-8 pl-0 border-0" asChild>
                <Link 
                    to={isPersonal 
                        ? Paths.personal
                        : isSystem 
                            ? Paths.system
                            : Paths.team(slug)
                    }
                    className="w-full h-full flex items-center gap-2"
                >
                    <div className="truncate font-semibold text-center">
                        {isPersonal ? "Personal Account" : organization.name}
                    </div>
                </Link>
            </Button>

            {/* <NavItem label="About" href="/about" icon={<InfoIcon/>}/> */}

            <Show when={isTeam}>
                <NavCollapsible label="Competencies" icon={<PocketKnifeIcon/>}>
                    <NavSubItem path={Paths.team(slug).competencies.skillChecks}/>
                    <NavSubItem path={Paths.team(slug).competencies.sessions}/>
                    <NavSubItem path={Paths.team(slug).competencies.skills}/>
                    <NavSubItem path={Paths.team(slug).competencies.reports}/>
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

            <NavItem external label="Source Code" href={`${process.env.NEXT_PUBLIC_APP_REPOSITORY_URL}`} icon={<Image aria-hidden src="/github.svg" alt="Githib Icon" width={16} height={16}/>}/>

            <Show when={isSystem}>
                <NavCollapsible label="System Team">
                    <NavSubItem path={Paths.team('system').invitations}/>
                    <NavSubItem path={Paths.team('system').users}/>
                </NavCollapsible>
            </Show>

            <Show when={isTeam}>
                <Protect role="org:admin">
                    <NavCollapsible label="Team Admin" icon={<SettingsIcon/>}>
                        <NavSubItem path={Paths.team(slug).invitations}/>
                        <NavSubItem path={Paths.team(slug).users}/>
                    </NavCollapsible>
                </Protect>
            </Show>
            <NavCollapsible label="Tools" icon={<HammerIcon/>}>
                <NavSubItem path={Paths.tools.competencyRecorder}/>
            </NavCollapsible>
            <Show when={isSystem}>
                <NavItem path={Paths.system.teams}/>
            </Show>
            
        </NavSection>
        : <Skeleton className="w-full h-32 mb-2 [&_[data-slot=spinner]]:w-10 [&_[data-slot=spinner]]:h-10" variant="spinner"/>

}

/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { BadgeCheckIcon, KeyRoundIcon, SettingsIcon } from 'lucide-react'
import { NavItem, NavSection } from './nav-section'

import * as Paths from '@/paths'


export function NavPersonalSection() {
    return <NavSection title="Personal">
        <NavItem path={Paths.personal.account} icon={<BadgeCheckIcon/>}/>
        <NavItem path={Paths.personal.settings} icon={<SettingsIcon/>}/>
        <NavItem path={Paths.personal.d4hAccessTokens} icon={<KeyRoundIcon/>}/>
    </NavSection>
}
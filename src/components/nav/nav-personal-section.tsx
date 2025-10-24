/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { BadgeCheckIcon, KeyRoundIcon, SettingsIcon } from 'lucide-react'
import { NavItem, NavSection } from './nav-section'

import * as Paths from '@/paths'


export function NavPersonalSection() {
    const prefix = Paths.personal

    return <NavSection title="Personal">
        <NavItem path={prefix.account} icon={<BadgeCheckIcon/>}/>
        <NavItem path={prefix.settings} icon={<SettingsIcon/>}/>
        <NavItem path={prefix.d4hAccessTokens} icon={<KeyRoundIcon/>}/>
    </NavSection>
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { NavItem} from './nav-section'

import { PersonalD4HAccessTokensIcon, PersonalDashboardIcon, PersonalProfileIcon, PersonalSettingsIcon } from '@/components/icons'
import { S2_SidebarGroup, S2_SidebarGroupLabel, S2_SidebarMenu } from '@/components/ui/s2-sidebar'
import * as Paths from '@/paths'


export function NavPersonalMenu() {
   
    return <S2_SidebarGroup>
        <S2_SidebarGroupLabel>Personal</S2_SidebarGroupLabel>
        <S2_SidebarMenu>
            <NavItem path={Paths.personal.dashboard} icon={<PersonalDashboardIcon/>}/>
            <NavItem path={Paths.personal.profile} icon={<PersonalProfileIcon/>}/>
            <NavItem path={Paths.personal.settings} icon={<PersonalSettingsIcon/>}/>
            <NavItem path={Paths.personal.d4hAccessTokens} icon={<PersonalD4HAccessTokensIcon/>}/>
        </S2_SidebarMenu>
    </S2_SidebarGroup>
    
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /personal
 */

import { NavPersonalMenu } from '@/components/nav/nav-personal-menu'
import { AppSidebar } from '@/components/nav/app-sidebar'

export default async function Organization_Layout(props: LayoutProps<'/personal'>) {

    return <>
        <AppSidebar name="Personal">
            <NavPersonalMenu/>
        </AppSidebar>
        {props.children}
    </>
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { SidebarMenu, SidebarMenuItem, SidebarMenuSkeleton } from '../ui/sidebar'

export function NavSkeleton({ length = 5 }: { length?: number }) {
    return <SidebarMenu>
        {Array.from({ length }).map((_, index) => (
            <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
}
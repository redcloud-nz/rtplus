/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { RedirectToSignIn, useUser } from '@clerk/nextjs'


import * as Paths from '@/paths'

import { NotificationsMenu } from './notifications-menu'
import { UserMenu } from './user-menu'


export function ControlBar() {

    return <div
        data-slot="control-bar"
        className="fixed top-0 right-0 z-10 h-[calc(var(--header-height)-1px)] flex items-center gap-2 px-2"
    >
        <NotificationsMenu/>
        <UserMenu/>
    </div>
}

 




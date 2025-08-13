/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { BadgeCheck, ChevronsUpDown, KeyRoundIcon, LogOutIcon } from 'lucide-react'

import { RedirectToSignIn, useClerk, useUser } from '@clerk/nextjs'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import { getUserInitials } from '@/lib/utils'

import * as Paths from '@/paths'

export function NavUser() {

    const { isMobile } = useSidebar()
    const clerk = useClerk()
    const { isSignedIn, user} = useUser()

    const fullName = isSignedIn && user.fullName || ""
    const initials = getUserInitials(fullName)

    
    return <SidebarMenu>
        <SidebarMenuItem>
            { isSignedIn
                ? <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.imageUrl} alt={fullName} />
                                <AvatarFallback className="rounded-lg">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{fullName}</span>
                                <span className="truncate text-xs">{user.primaryEmailAddress?.emailAddress}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.imageUrl} alt={fullName} />
                                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{fullName}</span>
                                <span className="truncate text-xs">{user.primaryEmailAddress?.emailAddress}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href={Paths.personal.account.index}>
                                    <BadgeCheck />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem asChild>
                                <Link href={Paths.personal.whoami.index}>
                                    <ShieldQuestionIcon />
                                    {Paths.personal.whoami._label}
                                </Link>
                            </DropdownMenuItem> */}
                            <DropdownMenuItem asChild>
                                <Link href={Paths.personal.d4hAccessTokens.index}>
                                    <KeyRoundIcon/>
                                    {Paths.personal.d4hAccessTokens._label}
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => clerk.signOut({ redirectUrl: '/' })}>
                                <LogOutIcon/>
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                : <RedirectToSignIn/>
            }
        </SidebarMenuItem>
    </SidebarMenu>
}

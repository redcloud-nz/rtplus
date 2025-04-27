/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { ArrowRightLeftIcon, BadgeCheckIcon, BellIcon, CircleUserIcon, KeyRoundIcon, LayoutDashboardIcon, LogInIcon, LogOutIcon, ShieldQuestionIcon, WrenchIcon } from 'lucide-react'

import { SignInButton, useAuth, useClerk, useUser } from '@clerk/nextjs'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { cn, getUserInitials } from '@/lib/utils'
import * as Paths from '@/paths'


export type HeaderControlsProps = React.ComponentPropsWithRef<'div'> & {
    children?: React.ReactNode
    showSignIn?: boolean
    hidden?: boolean
}

export function HeaderControls({ children, className, hidden, showSignIn = true, ...props}: HeaderControlsProps) {

    const { orgSlug } = useAuth()
    const { user } = useUser()
    const clerk = useClerk()

    if(hidden) return null
  
    return <div className={cn("flex items-center px-1", className)} {...props}>
        {children}
        {user
            ? <>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant='ghost' size="icon" asChild>
                            <Link href={orgSlug ? Paths.team(orgSlug).dashboard : Paths.switchTeam}>
                                <LayoutDashboardIcon/>
                            </Link>  
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Dashboard</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant='ghost' size="icon">
                            <BellIcon/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Notifications</p>
                    </TooltipContent>
                </Tooltip>
                
                <DropdownMenu>
                <Tooltip>
                    <DropdownMenuTrigger asChild>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <CircleUserIcon/>
                            </Button>
                        </TooltipTrigger>
                    </DropdownMenuTrigger>
                        <TooltipContent>
                                <p>Account</p>
                            </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
                                    <AvatarFallback className="rounded-lg">{getUserInitials(user.fullName)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.fullName}</span>
                                    <span className="truncate text-xs">{user.primaryEmailAddress?.emailAddress}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href={Paths.personal.index}>
                                    <BadgeCheckIcon />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={Paths.personal.whoami}>
                                    <ShieldQuestionIcon />
                                    Who am I?
                                </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem asChild>
                                <Link href={Paths.config.index}>
                                    <WrenchIcon/>
                                    Configuration
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href={Paths.switchTeam}>
                                    <ArrowRightLeftIcon/>
                                    Switch Team
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => clerk.signOut({ redirectUrl: '/' })}>
                                <LogOutIcon/>
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
            : (showSignIn && <>
                <SignInButton>
                    <Button variant="outline"><LogInIcon/> Sign In</Button>
                </SignInButton>
            </>)
        }
    </div>
}
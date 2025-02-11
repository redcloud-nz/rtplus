/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { BadgeCheckIcon, BellIcon, CircleUserIcon, KeyRoundIcon, LogInIcon, LogOutIcon, ShieldQuestionIcon } from 'lucide-react'

import { SignedIn, SignedOut, SignInButton, useClerk } from '@clerk/nextjs'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from '@/components/ui/link'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'


import { cn, getUserInitials } from '@/lib/utils'
import * as Paths from '@/paths'


export function HeaderControls({ className, ...props}: React.ComponentPropsWithRef<'div'>) {

    const user = { name: "Alex Westphal", email: "alexwestphal.nz@gmail.com", avatar: "" }

    const clerk = useClerk()

    const initials = getUserInitials(user.name)

    return <div className={cn("flex gap-1 items-center px-1", className)} {...props}>
            <SignedIn>
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
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link href={Paths.account.profile}>
                                    <BadgeCheckIcon />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={Paths.account.d4hAccessKeys}>
                                    <KeyRoundIcon/>
                                    D4H Access Keys
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={Paths.account.whoami}>
                                    <ShieldQuestionIcon />
                                    Who am I?
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => clerk.signOut({ redirectUrl: '/' })}>
                            <LogOutIcon/>
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SignedIn>
            <SignedOut>
                <SignInButton>
                    <Button variant="outline"><LogInIcon/> Sign In</Button>
                </SignInButton>
            </SignedOut>
        </div>
}
'use client'

import { BadgeCheck, ChevronsUpDown, KeyRoundIcon, LogInIcon, LogOutIcon, ShieldQuestionIcon } from 'lucide-react'

import { SignedIn, SignedOut, SignInButton, useClerk } from '@clerk/nextjs'

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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import { Link } from './ui/link'

import * as Paths from '@/paths'
import { Button } from './ui/button'



export interface NavUserProps {
    user: {
        name: string
        email: string
        avatar: string
    }
}

export function NavUser({ user }: NavUserProps) {

    const { isMobile } = useSidebar()
    const clerk = useClerk()


    return <SidebarMenu>
        <SidebarMenuItem>
            <SignedIn>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">
                                    {user.name.split(' ').slice(0,2).map(part => part.charAt(0).toUpperCase()).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
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
                                    <BadgeCheck />
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
                <div className="flex justify-center">
                    <SignInButton>
                        <Button variant="outline"><LogInIcon/> Sign In</Button>
                    </SignInButton>
                </div>
            </SignedOut>
        </SidebarMenuItem>
    </SidebarMenu>
}

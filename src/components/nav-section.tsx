/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ChevronRight } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleProps, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ExternalLink, Link } from './ui/link'


export interface INavItem {
    title: string
    url: string
    icon?: React.ReactNode
    items?: INavSubItem[]
    defaultOpen?: boolean
    authRequired?: boolean
}

export interface INavSubItem {
    title: string
    url: string
}


export interface NavSectionProps {
    title: string
    children: React.ReactNode
}


export function NavSection({ title, children }: NavSectionProps) {
    return <SidebarGroup>
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarMenu>
            {children}
        </SidebarMenu>
    </SidebarGroup>
}


interface NavItemProps {
    label: string
    href: string
    icon?: React.ReactNode
}

export function NavItem({ label, href, icon }: NavItemProps) {

    return <SidebarMenuItem>
        <SidebarMenuButton tooltip={label} asChild>
            {href.startsWith('/')
                ? <Link href={href}>
                    {icon}
                    <span>{label}</span>
                </Link>
                : <ExternalLink href={href} noDecoration>
                    {icon}
                    <span>{label}</span>
                </ExternalLink>
            }
        </SidebarMenuButton>
    </SidebarMenuItem>
}


type NavCollapsibleProps = CollapsibleProps & {
    label: string
    icon?: React.ReactNode
}

export function NavCollapsible({ label, icon, children, ...props }: NavCollapsibleProps) {
    return <Collapsible
        asChild
        className="group/collapsible"
        {...props}
    >
        <SidebarMenuItem>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={label}>
                    {icon}
                    <span>{label}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarMenuSub>
                    {children}
                </SidebarMenuSub>
            </CollapsibleContent>
        </SidebarMenuItem>
    </Collapsible>
}

interface NavSubItemProps {
    label: string
    href: string
}

export function NavSubItem({ label, href }: NavSubItemProps) {
    return <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild>
        {href.startsWith('/')
            ? <Link href={href}>{label}</Link>
            : <ExternalLink href={href} noDecoration>{label}</ExternalLink>
        }
        </SidebarMenuSubButton>
    </SidebarMenuSubItem>
}
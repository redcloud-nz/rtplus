/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { ChevronRight, LucideProps } from 'lucide-react'

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
import { ExternalLink, Link } from '../ui/link'
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react'


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
    title?: string
    children: React.ReactNode
}


export function NavSection({ title, children }: NavSectionProps) {
    return <SidebarGroup>
        { title ? <SidebarGroupLabel>{title}</SidebarGroupLabel> : null }
        <SidebarMenu>
            {children}
        </SidebarMenu>
    </SidebarGroup>
}

type NavItemExternalProps = { external: true, label: string, href: string, icon?: ReactNode }
type NavItemInternalProps = { external?: never, href?: never, path: { label: string, href: string, icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> }, label?: string, icon?: ReactNode }
type NavItemProps = NavItemExternalProps | NavItemInternalProps

export function NavItem({ external, ...props }: NavItemProps) {

    if(external) {
        props = props as NavItemExternalProps
        return <SidebarMenuItem>
            <SidebarMenuButton tooltip={props.label} asChild>
                <ExternalLink href={props.href} noDecoration>
                    {props.icon}
                    <span>{props.label}</span>
                    </ExternalLink>
            </SidebarMenuButton>
        </SidebarMenuItem>
    } else {
        props = props as NavItemInternalProps
        return <SidebarMenuItem>
            <SidebarMenuButton tooltip={props.label ?? props.path.label} asChild>
                <Link to={props.path}>
                    {props.icon ?? (props.path.icon ? <props.path.icon /> : null)}
                    <span>{props.label ?? props.path.label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    }
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

type NavSubItemExternalProps = { external: true, label: string, href: string }
type NavSubItemInternalProps = { external?: never, href?: never, path: { label: string, href: string }, label?: string }
type NavSubItemProps = NavSubItemExternalProps | NavSubItemInternalProps

export function NavSubItem({ external, ...props }: NavSubItemProps) {

    if(external) {
        props = props as NavItemExternalProps
        return <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild>
                <ExternalLink href={props.href} noDecoration>
                    <span>{props.label}</span>
                    </ExternalLink>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    } else {
        props = props as NavItemInternalProps
        return <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild>
                <Link to={props.path}>
                    <span>{props.label ?? props.path.label}</span>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    }
}
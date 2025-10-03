/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ChevronRight, LucideProps } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { ComponentProps, ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleProps, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ExternalLink, Link } from '@/components/ui/link'
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
type NavItemInternalProps = { external?: never, href?: never, path: { label: string, href: string, icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> }, label?: string, icon?: ReactNode, prefetch?: boolean | null }
type NavItemProps = NavItemExternalProps | NavItemInternalProps

export function NavItem({ external, ...props }: NavItemProps) {
    const pathname = usePathname()

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
            <SidebarMenuButton tooltip={props.label ?? props.path.label} asChild isActive={pathname == props.path.href}>
                <Link to={props.path} prefetch={props.prefetch}>
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
    const pathname = usePathname()

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
            <SidebarMenuSubButton asChild isActive={pathname == props.path.href}>
                <Link to={props.path}>
                    <span>{props.label ?? props.path.label}</span>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    }
}

export function NavSectionHeadingLink({ children, ...props }: ComponentProps<typeof Link>) {
    return <Button variant="ghost" className="w-full h-8 pl-0 border-0" asChild>
        <Link {...props}>
            <div className="truncate font-semibold text-center">
                {children}
            </div>
        </Link>
    </Button>
}
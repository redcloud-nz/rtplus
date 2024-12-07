
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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


export interface NavItem {
    title: string
    url: string
    icon?: React.ReactNode
    items?: NavSubItem[]
    defaultOpen?: boolean
    authRequired?: boolean
}

export interface NavSubItem {
    title: string
    url: string
}


export interface NavSectionProps {
    items: NavItem[]
    title: string
    signedIn?: boolean
}


export function NavSection({ items, title, signedIn }: NavSectionProps) {

    return <SidebarGroup>
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarMenu>
            {items
                .filter(item => !item.authRequired || signedIn)
                .map((item) => (
                    item.items 
                        ? <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={item.defaultOpen}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={item.title}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.items?.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild>
                                                {subItem.url.startsWith('/')
                                                    ? <Link href={subItem.url}>{subItem.title}</Link>
                                                    : <a 
                                                        href={subItem.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >{subItem.title}</a>
                                                }
                                                
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    : <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton tooltip={item.title} asChild>
                            {item.url.startsWith('/')
                                ? <Link href={item.url}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                                : <a 
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {item.icon}
                                    <span>{item.title}</span>
                                </a>
                            }
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))
            }
        </SidebarMenu>
    </SidebarGroup>
}

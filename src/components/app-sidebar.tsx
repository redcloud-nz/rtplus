"use client"

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { BookOpen, Frame, Map, PieChart, PocketKnife, Settings2, SquareTerminal, UserCheck } from "lucide-react"

import { NavMain } from '@/components/nav-main'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'


// This is sample data.
const data = {
  navMain: [
    {
      title: "D4H Unified",
      url: "/unified",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Personnel",
          url: "/unified/personnel",
        },
        {
          title: "Calendar",
          url: "/unified/calendar",
        },
        {
          title: "Equipment",
          url: "/unified/equipment",
        },
      ],
    },
    {
        title: "Availability",
        url: "/availability",
        icon: UserCheck,
    },
    {
        title: "Competencies",
        url: "/competencies",
        icon: PocketKnife,
        items: [
            {
                title: "Record",
                url: "/competencies/record"
            },
            {
                title: "Manage",
                url: "/competencies/manage"
            },
            {
                title: "Report",
                url: "/competencies/report"
            }
        ]
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Teams",
          url: "#",
        },
        {
          title: "D4H Access Keys",
          url: "/user/d4h-access-keys",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="mt-2">
            <Link href="/dashboard">
                <Image
                    className="dark:invert"
                    src="/logo.svg"
                    alt="RT+ logo"
                    width={150}
                    height={75}
                    priority
                />
            </Link>
        </SidebarHeader>
        <SidebarContent>
            <NavMain items={data.navMain} />
            {/* <NavProjects projects={data.projects} /> */}
        </SidebarContent>
        <SidebarFooter>
            {/* <NavUser/> */}
        </SidebarFooter>
            <SidebarRail />
    </Sidebar>
}

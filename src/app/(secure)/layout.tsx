
import { UserProvider } from '@auth0/nextjs-auth0/client'

import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
  } from '@/components/ui/sidebar'

export default function SecureLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <UserProvider>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    </UserProvider>
}
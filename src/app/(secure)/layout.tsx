'use client'

import { UserProvider } from '@auth0/nextjs-auth0/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'


const queryClient = new QueryClient()

export default function SecureLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <UserProvider>
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    {children}
                </SidebarInset>
            </SidebarProvider>
            <Toaster/>
        </QueryClientProvider>
    </UserProvider>
}
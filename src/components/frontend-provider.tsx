'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'

export type FrontendProviderProps = Readonly<{
    children: React.ReactNode
}>

const queryClient = new QueryClient()

export function FrontendProvider({ children}: FrontendProviderProps) {
    return <QueryClientProvider client={queryClient}>
        <SidebarProvider>
            {children}
        </SidebarProvider>
        <Toaster/>
    </QueryClientProvider>
}

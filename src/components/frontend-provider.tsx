'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

export type FrontendProviderProps = Readonly<{
    children: React.ReactNode
}>

const queryClient = new QueryClient()

export function FrontendProvider({ children}: FrontendProviderProps) {
    return <QueryClientProvider client={queryClient}>
        <SidebarProvider>
            <TooltipProvider>
            {children}
            </TooltipProvider>
        </SidebarProvider>
        <Toaster/>
    </QueryClientProvider>
}

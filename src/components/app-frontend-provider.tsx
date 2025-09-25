/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import * as React from 'react'

import { init, printConsoleMessage } from '@/cli/init'

import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

import { getQueryClient } from '@/trpc/client'
import { QueryClientProvider } from '@tanstack/react-query'


export type FrontendProviderProps = Readonly<{
    children: React.ReactNode
}>

export function AppFrontendProvider({ children }: FrontendProviderProps) {
    const queryClient = getQueryClient()

    React.useEffect(() => {
        printConsoleMessage()

        Object.assign(window, { init })
    }, [])

    return <QueryClientProvider client={queryClient}>
        <SidebarProvider>
            <TooltipProvider>
            {children}
            </TooltipProvider>
        </SidebarProvider>
        <Toaster/>
    </QueryClientProvider>
}


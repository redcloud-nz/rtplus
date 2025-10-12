/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { ReactNode, useEffect, useRef } from 'react'

import { useOrganization, useUser } from '@clerk/nextjs'
import { QueryClientProvider } from '@tanstack/react-query'

import { init, printConsoleMessage } from '@/cli/init'

import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

import { getQueryClient } from '@/trpc/client'
import { initUser } from '@/server/init-user'


export type FrontendProviderProps = Readonly<{
    children: ReactNode
}>

export function AppFrontendProvider({ children }: FrontendProviderProps) {
    const queryClient = getQueryClient()

    const { isLoaded: isUserLoaded, user } = useUser()
    const { isLoaded: isOrgLoaded, organization } = useOrganization()

    const prevOrgRef = useRef<string | null>(null)

    useEffect(() => {
        printConsoleMessage()

        Object.assign(window, { init })
    }, [])

    useEffect(() => {
        if(isUserLoaded && isOrgLoaded && user) {
            const orgId = organization?.id || null
            if(prevOrgRef.current !== orgId) {
                if(prevOrgRef.current !== null) {
                    // Changed organizations - clear the query cache
                    queryClient.clear()
                }

                prevOrgRef.current = orgId
            }
            initUser({ userId: user.id, orgId })
                .then(() => {
                    console.log("User initialization complete")
                })
                .catch((err) => {
                    console.error("Error initializing user:", err)
                })
        }

    }, [isOrgLoaded, isUserLoaded, organization, user])

    return <QueryClientProvider client={queryClient}>
        <SidebarProvider>
            <TooltipProvider>
                {children}
            </TooltipProvider>
        </SidebarProvider>
        <Toaster/>
    </QueryClientProvider>
}
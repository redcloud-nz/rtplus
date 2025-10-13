/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { createContext, ReactNode, useContext, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { UserSettings, OrganizationSettings, DefaultOrganizationSettings, DefaultUserSettings } from '@/lib/schemas/settings'

import { trpc } from '@/trpc/client'

type AppContext = { userSettings: UserSettings, organizationSettings: OrganizationSettings }

const AppContext = createContext<AppContext | undefined>(undefined)

export function AppContextProvider({ children }: { children: ReactNode }) {

    const { data: organizationSettings = DefaultOrganizationSettings } = useQuery(trpc.settings.getOrganizationSettings.queryOptions(undefined, { staleTime: 60 * 60 * 1000 }))
    const { data: userSettings = DefaultUserSettings } = useQuery(trpc.settings.getUserSettings.queryOptions(undefined,{ staleTime: 60 * 60 * 1000 }))

    const value = useMemo(() => ({ userSettings, organizationSettings }), [userSettings, organizationSettings])

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {

    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within a AppContextProvider')
    }
    return context
}


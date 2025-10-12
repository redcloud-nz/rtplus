/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { createContext, ReactNode, useContext } from 'react'

import { UserSettings, OrganizationSettings } from '@/lib/schemas/settings'

//import { useOrganization, useUser } from '@clerk/nextjs'





type SettingsContext = { userSettings: UserSettings, organizationSettings: OrganizationSettings}

const SettingsContext = createContext<SettingsContext | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
    

    const value = { userSettings: {}, organizationSettings: {} }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {

    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}
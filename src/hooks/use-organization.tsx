/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { OrganizationData } from '@/lib/schemas/organization'
import { trpc } from '@/trpc/client'


const OrganizationContext = createContext<OrganizationData & { refresh: () => Promise<void> } | undefined>(undefined)

export function OrganizationProvider({ children, initial }: { children: ReactNode, initial: OrganizationData }) {
    const queryClient = useQueryClient()

    const [organization, setOrganization] = useState<OrganizationData>(initial)

    const value = useMemo(() => ({
        ...organization,
        async refresh() {
            const updatedOrg = await queryClient.fetchQuery(trpc.organizations.getOrganization.queryOptions({ orgId: organization.orgId }))
            setOrganization(updatedOrg)
        }
    }), [organization, queryClient])

    return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export const useOrganization: () => OrganizationData & { refresh: () => Promise<void> } = () => {
    const context = useContext(OrganizationContext)
    if (!context) {
        throw new Error('useOrganization must be used within an OrganizationProvider')
    }
    return context
}

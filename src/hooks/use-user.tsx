/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { createContext, ReactNode, useContext, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { UserData } from '@/lib/schemas/user'
import { trpc } from '@/trpc/client'



const UserContext = createContext<UserData & { refresh: () => void } | undefined>(undefined)

export function UserProvider({ children, initial }: { children: ReactNode, initial: UserData }) {
    const queryClient = useQueryClient()

    const [user, setUser] = useState<UserData>(initial)

    const value = useMemo(() => ({
        ...user,
        async refresh() {
            const updatedUser = await queryClient.fetchQuery(trpc.users.getCurrentUser.queryOptions())
            setUser(updatedUser)
        }
    }), [user, queryClient])

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser: () => UserData & { refresh: () => void } = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ReactNode } from 'react'


import { Alert } from '@/components/ui/alert'
import { useActiveTeam } from '@/hooks/use-active-team'


const DefaultMessage = "You need to be signed in to a team to access this feature."

export function RequireActiveTeam({ children, message = DefaultMessage }: { children: ReactNode, message?: ReactNode }) {
    const activeTeam = useActiveTeam()

    return activeTeam
        ? children 
        : <Alert severity="error" title="Active Team Required">
            {message}
        </Alert>
}
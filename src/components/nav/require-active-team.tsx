/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { ReactNode } from 'react'

import { useOrganization } from '@clerk/nextjs'

import { Alert } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { Show } from '../show'

const DefaultMessage = "You must be part of an active team to access this feature."

export function RequireActiveTeam({ children, message = DefaultMessage }: { children: ReactNode, message?: ReactNode }) {
    const { isLoaded, organization } = useOrganization()

    return <Show 
        when={isLoaded}
        fallback={<div className="w-full h-16 flex items-center justify-center rounded-md bg-muted animate-pulse">
            <LoadingSpinner className="w-12 h-12"/>
        </div>}
    >
        {organization 
            ? children 
            : <Alert severity="error" title="Active Team Required">
                {message}
            </Alert>
        }
    </Show>
}
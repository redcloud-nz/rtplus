/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { ReactNode } from 'react'

import { useAppContext } from '@/hooks/use-app-context'
import { type ModuleID } from '@/lib/schemas/modules'


export function ModuleOnly({ children, fallback, module }: { children: ReactNode, fallback?: ReactNode, module: ModuleID }) {

    const appContext = useAppContext()

    if (!appContext.organizationSettings.enabledModules.includes(module)) {
        return fallback ?? null
    }

    return <>{children}</>
}
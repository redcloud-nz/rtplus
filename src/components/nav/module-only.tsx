/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import { ReactNode } from 'react'

import { useOrganization } from '@/hooks/use-organization'
import { type ModuleID } from '@/lib/modules'



export function ModuleOnly({ children, fallback, module }: { children: ReactNode, fallback?: ReactNode, module: ModuleID }) {

    const organization = useOrganization()

    if (!organization.settings.modules[module]?.enabled) {
        return fallback ?? null
    }

    return <>{children}</>
}
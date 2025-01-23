/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as React from 'react'

import { auth } from '@clerk/nextjs/server'

import { hasPermission, Permission } from '@/lib/permissions'


export interface ProtectProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    permission: Permission
    teamId?: string
}

export async function Protect({ children, fallback, permission, teamId = 'system' }: ProtectProps): Promise<React.JSX.Element | null> {

    const { sessionClaims } = await auth()

    const authorized = <>{children}</>
    const unauthorized = fallback ? <>{fallback}</> : null

    if(!sessionClaims) return unauthorized

    if(hasPermission(sessionClaims, teamId, permission)) return authorized
    else return unauthorized
}
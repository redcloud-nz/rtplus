/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import * as React from 'react'

import { hasPermission, isSystemPermission, isTeamPermission, SystemPermissionKey, TeamPermissionKey } from '@/lib/permissions'
import { trpc } from '@/trpc/client'

type ProtectSystemProps = { permission: SystemPermissionKey }
type ProtectTeamProps = { permission: TeamPermissionKey, teamId: string }

export type ProtectProps = {
    children: React.ReactNode
    fallback?: React.ReactNode
    allowSystem?: boolean
} & (ProtectSystemProps | ProtectTeamProps)

export function Protect(props: ProtectProps) {

    const permissionsQuery = trpc.currentUser.compactPermissions.useQuery(undefined, { staleTime: 1000 * 60 * 10 })

    if(permissionsQuery.isSuccess) {
        
        const authorized = <>{props.children}</>
        const unauthorized = props.fallback ? <>{props.fallback}</> : null

        if(props.allowSystem && hasPermission(permissionsQuery.data, 'system:write')) return authorized

        if(isSystemPermission(props.permission)) {
            const { permission } = props as ProtectSystemProps

            return hasPermission(permissionsQuery.data, permission) ? authorized : unauthorized
        } else if(isTeamPermission(props.permission)) {
            const { permission, teamId } = props as ProtectTeamProps

            return hasPermission(permissionsQuery.data, permission, teamId) ? authorized : unauthorized
        } else {
            throw new Error(`Unknown permission prefix: ${props.permission}`)
        }
    } else return null
}
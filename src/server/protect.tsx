/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as React from 'react'

import { isSystemPermission, isTeamPermission, SystemPermissionKey, TeamPermissionKey } from '@/lib/permissions'
import { authenticated } from '@/server/auth'

type ProtectSystemProps = { permission: SystemPermissionKey }
type ProtectTeamProps = { permission: TeamPermissionKey, teamId: string }

export type ProtectProps = {
    children: React.ReactNode
    fallback?: React.ReactNode
    allowSystem?: boolean
} & (ProtectSystemProps | ProtectTeamProps)

export async function ServerProtect(props: ProtectProps): Promise<React.JSX.Element | null> {

    const { hasPermission } = await authenticated()

    const authorized = <>{props.children}</>
    const unauthorized = props.fallback ? <>{props.fallback}</> : null

    if(isSystemPermission(props.permission)) {
        return hasPermission(props.permission) ? authorized : unauthorized

    } else if(isTeamPermission(props.permission)) {
        const { permission, teamId } = props as ProtectTeamProps

        if(props.allowSystem && hasPermission('system:write')) return authorized

        return hasPermission(permission, teamId) ? authorized : unauthorized
    } else {
        throw new Error(`Unknown permission prefix: ${props.permission}`)
    }
}
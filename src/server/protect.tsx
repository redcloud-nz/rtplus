/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as React from 'react'

import { SkillPackagePermissionKey, SystemPermissionKey, TeamPermissionKey } from '@/server/permissions'
import { authenticated } from '@/server/auth'

type ProtectSkillPackageProps = { permission: SkillPackagePermissionKey, skillPackageId: string }
type ProtectSystemProps = { permission: SystemPermissionKey }
type ProtectTeamProps = { permission: TeamPermissionKey, teamId: string }

export type ProtectProps = {
    children: React.ReactNode
    fallback?: React.ReactNode
    allowSystem?: boolean
} & (ProtectSkillPackageProps | ProtectSystemProps | ProtectTeamProps)

export async function ServerProtect(props: ProtectProps): Promise<React.JSX.Element | null> {

    const { hasPermission } = await authenticated()

    const authorized = <>{props.children}</>
    const unauthorized = props.fallback ? <>{props.fallback}</> : null

    if(props.permission.startsWith('skill-package:')) {
        const { permission, skillPackageId } = props as ProtectSkillPackageProps

        if(props.allowSystem && hasPermission('system:write')) return authorized

        return hasPermission(permission, skillPackageId) ? authorized : unauthorized
    } else if(props.permission.startsWith('system:')) {
        const { permission } = props as ProtectSystemProps

        return hasPermission(permission) ? authorized : unauthorized
    } else if(props.permission.startsWith('team:')) {
        const { permission, teamId } = props as ProtectTeamProps

        if(props.allowSystem && hasPermission('system:write')) return authorized

        return hasPermission(permission, teamId) ? authorized : unauthorized
    } else {
        throw new Error(`Unknown permission prefix: ${props.permission}`)
    }
}
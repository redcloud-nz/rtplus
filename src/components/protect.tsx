/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as React from 'react'

import { hasPermission, SkillPackagePermissionKey, SystemPermissionKey, TeamPermissionKey } from '@/server/permissions'
import { trpc } from '@/trpc/client'

type ProtectSkillPackageProps = { permission: SkillPackagePermissionKey, skillPackageId: string }
type ProtectSystemProps = { permission: SystemPermissionKey }
type ProtectTeamProps = { permission: TeamPermissionKey, teamId: string }

export type ProtectProps = {
    children: React.ReactNode
    fallback?: React.ReactNode
    allowSystem?: boolean
} & (ProtectSkillPackageProps | ProtectSystemProps | ProtectTeamProps)

export function ClientProtect(props: ProtectProps) {

    const permissionsQuery = trpc.currentUser.compactPermissions.useQuery(undefined, { staleTime: 1000 * 60 * 10 })

    if(permissionsQuery.isSuccess) {
        
        const authorized = <>{props.children}</>
        const unauthorized = props.fallback ? <>{props.fallback}</> : null

        if(props.allowSystem && hasPermission(permissionsQuery.data, 'system:write')) return authorized

        if(props.permission.startsWith('skill-package:')) {
            const { permission, skillPackageId } = props as ProtectSkillPackageProps

            return hasPermission(permissionsQuery.data, permission, skillPackageId) ? authorized : unauthorized
        } else if(props.permission.startsWith('system:')) {
            const { permission } = props as ProtectSystemProps

            return hasPermission(permissionsQuery.data, permission) ? authorized : unauthorized
        } else if(props.permission.startsWith('team:')) {
            const { permission, teamId } = props as ProtectTeamProps

            return hasPermission(permissionsQuery.data, permission, teamId) ? authorized : unauthorized
        } else {
            throw new Error(`Unknown permission prefix: ${props.permission}`)
        }
    } else return null
}
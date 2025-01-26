/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as React from 'react'

import { PrefixedSkillPackagePermission, PrefixedSystemPermission, PrefixedTeamPermission } from '@/lib/permissions'
import { authenticated } from '@/lib/server/auth'

type ProtectSkillPackageProps = { permission: PrefixedSkillPackagePermission, skillPackageId: string }
type ProtectSystemProps = { permission: PrefixedSystemPermission }
type ProtectTeamProps = { permission: PrefixedTeamPermission, teamId: string }

export type ProtectProps = {
    children: React.ReactNode
    fallback?: React.ReactNode
} & (ProtectSkillPackageProps | ProtectSystemProps | ProtectTeamProps)

export async function Protect(props: ProtectProps): Promise<React.JSX.Element | null> {

    const { hasPermission } = await authenticated()

    const authorized = <>{props.children}</>
    const unauthorized = props.fallback ? <>{props.fallback}</> : null

    if(props.permission.startsWith('skill-package:')) {
        const { permission, skillPackageId } = props as ProtectSkillPackageProps

        return hasPermission(permission, skillPackageId) ? authorized : unauthorized
    } else if(props.permission.startsWith('system:')) {
        const { permission } = props as ProtectSystemProps

        return hasPermission(permission) ? authorized : unauthorized
    } else if(props.permission.startsWith('team:')) {
        const { permission, teamId } = props as ProtectTeamProps

        return hasPermission(permission, teamId) ? authorized : unauthorized
    } else {
        throw new Error(`Unknown permission prefix: ${props.permission}`)
    }
}
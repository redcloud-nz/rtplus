/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as R from 'remeda'

import { validateUUID } from '../lib/id'

export const Permissions = {
    SkillPackageWrite: 'skill-package:write',
    SystemWrite: 'system:write',
    TeamAssessCompetencies: 'team:assess',
    TeamRead: 'team:read',
    TeamWrite: 'team:write',
} as const

export type SkillPackagePermissionKey = typeof Permissions.SkillPackageWrite
export type SystemPermissionKey = typeof Permissions.SystemWrite
export type TeamPermissionKey =  typeof Permissions.TeamAssessCompetencies | typeof Permissions.TeamRead | typeof Permissions.TeamWrite

export type PermissionKey = SkillPackagePermissionKey | SystemPermissionKey | TeamPermissionKey

export type ShortKey = 'a' | 'r' | 'w'

export type ShortPermissions = `${'a' | ''}${'r' | ''}${'w' | ''}`

export const PermissionKeyToShortKeyMap: Record<PermissionKey, ShortKey> = {
    'skill-package:write': 'w',
    'system:write': 'w',
    'team:assess': 'a',
    'team:read': 'r',
    'team:write': 'w',
}

export type CompactPermissions = Pick<CustomJwtSessionClaims, 'rt_ssp' | 'rt_sp' | 'rt_tp'>

export function hasPermission(sessionClaims: CompactPermissions | null, permission: SkillPackagePermissionKey, skillPackageId: string): boolean;
export function hasPermission(sessionClaims: CompactPermissions | null, permission: SystemPermissionKey): boolean;
export function hasPermission(sessionClaims: CompactPermissions | null, permission: TeamPermissionKey, teamId: string): boolean;
export function hasPermission(sessionClaims: CompactPermissions | null, permission: PermissionKey, id?: string): boolean {
    return checkSessionPermissions(sessionClaims, permission, id)
}

/**
 * Check if the provided session claims have the required permission.
 * @param compactPermissions Claims to check for permissions
 * @param permission Requested permission
 * @param id Permission target id or '*' for any
 * @returns True if the session has the required permission, false otherwise
 */
export function checkSessionPermissions(sessionClaims: CompactPermissions | null, permission: PermissionKey, id?: string): boolean {
    if(sessionClaims === null) return false
    const { rt_ssp: skillPackagePermissions, rt_sp: systemPermissions, rt_tp: teamPermissions } = sessionClaims


    const shortKey = PermissionKeyToShortKeyMap[permission]

    if(permission.startsWith('skill-package:')) {
        
        if(id == '*') return R.values(skillPackagePermissions).some(permissions => permissions.includes(shortKey))

        if(id == undefined ||  !validateUUID(id)) throw new Error(`Invalid skillPackageId: ${id}`)

        const shortId = id.substring(0, 8)
        return (skillPackagePermissions[shortId] ?? '').includes(shortKey)

    } else if(permission.startsWith('system:')) {

        return systemPermissions.includes(shortKey)

    } else if(permission.startsWith('team:')) {

        if(id == '*') return R.values(teamPermissions).some(permissions => permissions.includes(shortKey))

        if(id == undefined ||  !validateUUID(id)) throw new Error(`Invalid teamId: ${id}`)

        const shortId = id.substring(0, 8)
        return (teamPermissions[shortId] ?? '').includes(shortKey)
    }

    throw new Error(`Unknown permission prefix: ${permission}`)
}
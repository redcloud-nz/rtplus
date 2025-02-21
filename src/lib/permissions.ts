/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as R from 'remeda'

import { validateUUID } from './id'
import { TeamPermission } from '@prisma/client'

export const Permissions = {
    ManagePersonnel: 'system:manage-personnel',
    ManageSkillPackages: 'system:manage-skill-packages',
    ManageTeams: 'system:manage-teams',
    SystemWrite: 'system:write',
    TeamAssessCompetencies: 'team:assess-skills',
    TeamMembers: 'team:manage-members',
    TeamRead: 'team:read',
    TeamWrite: 'team:write',
} as const

export const PermissionList = ['system:manage-personnel', 'system:manage-skill-packages', 'system:manage-teams', 'system:write', 'team:assess-skills', 'team:manage-members', 'team:read', 'team:write'] as const

export type SystemPermissionKey = typeof Permissions.ManagePersonnel | typeof Permissions.ManageSkillPackages | typeof Permissions.ManageTeams | typeof Permissions.SystemWrite
export type TeamPermissionKey =  typeof Permissions.TeamAssessCompetencies | typeof Permissions.TeamMembers | typeof Permissions.TeamRead | typeof Permissions.TeamWrite

export type PermissionKey = SystemPermissionKey | TeamPermissionKey

export function isSystemPermission(key: PermissionKey): key is SystemPermissionKey {
    return key.startsWith('system:')
}
export function isTeamPermission(key: PermissionKey): key is TeamPermissionKey {
    return key.startsWith('team:')
}

export type SystemShortKey = 'p' | 's' | 't' | 'w'
export type TeamShortKey = 'a' | 'm' | 'r' | 'w'

export type ShortKey = SystemShortKey | TeamShortKey

export type SystemShortPermissions = `${'p' | ''}${'s' | ''}${'t' | ''}${'w' | ''}`
export type TeamShortPermissions = '' | `${'a' | ''}${'m' | ''}r${'w' | ''}`

export const SystemPermissionKeyToShortKeyMap: Record<SystemPermissionKey, SystemShortKey> = {
    'system:manage-personnel': 'p',
    'system:manage-skill-packages': 's',
    'system:manage-teams': 't',
    'system:write': 'w',
}

export const SystemShortKeyToPermissionKeyMap: Record<SystemShortKey, SystemPermissionKey> = {
    'p': 'system:manage-personnel',
    's': 'system:manage-skill-packages',
    't': 'system:manage-teams',
    'w': 'system:write',
}

export const TeamPermissionKeyToShortKeyMap: Record<TeamPermissionKey, TeamShortKey> = {
    'team:assess-skills': 'a',
    'team:manage-members': 'm',
    'team:read': 'r',
    'team:write': 'w',
}

export const TeamShortKeyToPermissionKeyMap: Record<TeamShortKey, TeamPermissionKey> = {
    'a': 'team:assess-skills',
    'm': 'team:manage-members',
    'r': 'team:read',
    'w': 'team:write',
}

export type CompactPermissions = Pick<CustomJwtSessionClaims, 'rt_sp' | 'rt_tp'>

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
    const { rt_sp: systemPermissions, rt_tp: teamPermissions } = sessionClaims

    if(isSystemPermission(permission)) {
        const shortKey = SystemPermissionKeyToShortKeyMap[permission]

        return systemPermissions.includes(shortKey)

    } else if(isTeamPermission(permission)) {
        const shortKey = TeamPermissionKeyToShortKeyMap[permission]

        if(id == '*') return R.values(teamPermissions).some(permissions => permissions.includes(shortKey))

        if(id == undefined ||  !validateUUID(id)) throw new Error(`Invalid teamId: ${id}`)

        const shortId = id.substring(0, 8)
        return (teamPermissions[shortId] ?? '').includes(shortKey)
    }

    throw new Error(`Unknown permission prefix: ${permission}`)
}

export function buildCompactSystemPermissions(permissions: SystemPermissionKey[]): UserPublicMetadata['systemPermissions'] {
    return permissions.map(p => SystemPermissionKeyToShortKeyMap[p]).sort().join('') as SystemShortPermissions
}

export function buildCompactTeamPermissions(permissions: TeamPermission[]): UserPublicMetadata['teamPermissions'] {
    const result: UserPublicMetadata['teamPermissions'] = {}

    for(const tp of permissions) {
        const shortId = tp.teamId.substring(0, 8)
        const shortPermissions = (tp.permissions as TeamPermissionKey[]).map(p => TeamPermissionKeyToShortKeyMap[p]).sort().join('') as TeamShortPermissions
        result[shortId] = shortPermissions
    }

    return result
}
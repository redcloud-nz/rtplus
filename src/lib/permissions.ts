/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

export const AdminPermission = 'admin'
export const AssessCompetenciesPermission = 'assess'
export const ReadPermission = 'read'

export type Permission =  typeof AdminPermission | typeof AssessCompetenciesPermission | typeof ReadPermission

export type Permissions = Permission | `${Permission},${Permission}` | `${Permission},${Permission},${Permission}`

export type PermissionSet = Record<string, Permissions>

export function hasPermission(session: CustomJwtSessionClaims, teamId: string, permission: Permission): boolean {
    if(!session.permissions) return false

    // System Admins have all permissions
    const systemPerms = session.permissions.system?.split(',') ?? []
    if(systemPerms.includes(AdminPermission)) return true

    const shortTeamId = teamId == 'system' ? 'system' : teamId.substring(0, 8)

    const perms = (session.permissions[shortTeamId]?.split(',') ?? []) as Permission[]
    return perms.includes(permission)
}
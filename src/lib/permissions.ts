/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

export type ReadPermission = 'r'
export type AdminPermission = 'a'
export type AssessCompetenciesPermission = 'ac'

export type Permission = ReadPermission | AssessCompetenciesPermission

export type Permissions = Permission[]

export type PermissionSet = Record<string, Permissions>

export function hasPermission(session: CustomJwtSessionClaims, teamId: string, permission: Permission): boolean {
    const perms = session.permissions[teamId]
    return perms && perms.includes(permission)
}
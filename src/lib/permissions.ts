/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { validateUUID } from "./id"


export const AssessCompetenciesPermission = 'assess'
export const ReadPermission = 'read'
export const WritePermission = 'write'

export type SkillPackagePermission = typeof WritePermission
export type SystemPermission = typeof WritePermission
export type TeamPermission =  typeof AssessCompetenciesPermission | typeof ReadPermission | typeof WritePermission

export type PrefixedSkillPackagePermission = `skill-package:${SkillPackagePermission}`
export type PrefixedSystemPermission = `system:${SystemPermission}`
export type PrefixedTeamPermission = `team:${TeamPermission}`

export type PrefixedPermission = PrefixedSkillPackagePermission | PrefixedSystemPermission | PrefixedTeamPermission

export function hasPermission(sessionClaims: CustomJwtSessionClaims | null, permission: PrefixedSkillPackagePermission, skillPackageId: string): boolean;
export function hasPermission(sessionClaims: CustomJwtSessionClaims | null, permission: PrefixedSystemPermission): boolean;
export function hasPermission(sessionClaims: CustomJwtSessionClaims | null, permission: PrefixedTeamPermission, teamId: string): boolean;
export function hasPermission(sessionClaims: CustomJwtSessionClaims | null, permission: PrefixedPermission, id?: string): boolean {
    return hasPermissionInternal(sessionClaims, permission, id)
}

export function hasPermissionInternal(sessionClaims: CustomJwtSessionClaims | null, permission: PrefixedPermission, id?: string): boolean {
    if(sessionClaims === null) return false
    const { rt_ssp: skillPackagePermissions, rt_sp: systemPermissions, rt_tp: teamPermissions } = sessionClaims

    if(permission.startsWith('skill-package:')) {
        const shortPermission = permission.substring('skill-package:'.length) as SkillPackagePermission
        
        if(id == undefined ||  !validateUUID(id)) throw new Error(`Invalid skillPackageId: ${id}`)
        const shortId = id.substring(8)
       
        return skillPackagePermissions[shortId]?.includes(shortPermission) ?? false

    } else if(permission.startsWith('system:')) {
        const shortPermission = permission.substring('system:'.length) as SystemPermission

        return systemPermissions.includes(shortPermission)
    } else if(permission.startsWith('team:')) {
        const shortPermission = permission.substring('team:'.length) as TeamPermission

        if(id == undefined ||  !validateUUID(id)) throw new Error(`Invalid teamId: ${id}`)
            const shortId = id.substring(8)

        return teamPermissions[shortId]?.includes(shortPermission) ?? false
    }

    throw new Error(`Unknown permission prefix: ${permission}`)
}
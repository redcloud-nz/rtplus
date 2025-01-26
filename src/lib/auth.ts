/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

import { auth } from '@clerk/nextjs/server'

import { hasPermissionInternal, PrefixedPermission, PrefixedSkillPackagePermission, PrefixedSystemPermission, PrefixedTeamPermission } from './permissions'

type ClerkAuthObject = Awaited<ReturnType<typeof auth.protect>>


export interface RTPlusAuthObject {
    readonly authObject: ClerkAuthObject
    readonly userPersonId: string

    
    hasPermission(permission: PrefixedSkillPackagePermission, skillPackageId: string): boolean
    hasPermission(permission: PrefixedSystemPermission): boolean
    hasPermission(permission: PrefixedTeamPermission, teamId: string): boolean
}

export async function authenticated(): Promise<RTPlusAuthObject> {
    const clerkAuthObject = await auth.protect()

    return {
        authObject: clerkAuthObject,
        userPersonId: clerkAuthObject.sessionClaims.rt_pid,
        hasPermission(permission: PrefixedPermission, id?: string): boolean {
            return hasPermissionInternal(clerkAuthObject.sessionClaims, permission, id)
        },
    }
}
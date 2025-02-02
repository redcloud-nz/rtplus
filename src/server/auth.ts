/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

import { auth } from '@clerk/nextjs/server'

import { checkSessionPermissions, PermissionKey, SkillPackagePermissionKey, SystemPermissionKey, TeamPermissionKey } from './permissions'

type ClerkAuthObject = Awaited<ReturnType<typeof auth.protect>>


export interface RTPlusAuthObject {
    readonly authObject: ClerkAuthObject
    readonly userPersonId: string

    
    hasPermission(permission: SkillPackagePermissionKey, skillPackageId: string): boolean
    hasPermission(permission: SystemPermissionKey): boolean
    hasPermission(permission: TeamPermissionKey, teamId: string): boolean
}

export async function authenticated(): Promise<RTPlusAuthObject> {
    const clerkAuthObject = await auth.protect()

    return {
        authObject: clerkAuthObject,
        userPersonId: clerkAuthObject.sessionClaims.rt_pid,
        hasPermission(permission: PermissionKey, id?: string): boolean {
            return checkSessionPermissions(clerkAuthObject.sessionClaims, permission, id)
        },
    }
}
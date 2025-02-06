/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

import { pick } from 'remeda'

import { auth } from '@clerk/nextjs/server'
import { AuthObject as ClerkAuthObject } from '@clerk/backend'

import { checkSessionPermissions, CompactPermissions, PermissionKey, SkillPackagePermissionKey, SystemPermissionKey, TeamPermissionKey } from './permissions'


export interface RTPlusAuthObject {
    readonly authObject: ClerkAuthObject
    readonly userPersonId: string
    readonly permissions: CompactPermissions
    
    hasPermission(permission: SkillPackagePermissionKey, skillPackageId: string): boolean
    hasPermission(permission: SystemPermissionKey): boolean
    hasPermission(permission: TeamPermissionKey, teamId: string): boolean
}





export function createAuthObject(authObject: ClerkAuthObject): RTPlusAuthObject {
    if(authObject.userId) 
        return {
            authObject,
            userPersonId: authObject.sessionClaims.rt_pid,
            permissions: pick(authObject.sessionClaims, ['rt_ssp', 'rt_sp', 'rt_tp']),
            hasPermission(permission: PermissionKey, id?: string): boolean {
                return checkSessionPermissions(authObject.sessionClaims, permission, id)
            },
        } 
    else 
        return {
            authObject,
            userPersonId: '',
            permissions: { rt_ssp: {}, rt_sp: '', rt_tp: {} },
            hasPermission(): boolean {
                return false
            },
        }
}

export async function authenticated(): Promise<RTPlusAuthObject> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('server-only');

    const clerkAuthObject = await auth.protect()

    return createAuthObject(clerkAuthObject)
}
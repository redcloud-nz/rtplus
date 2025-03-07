/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */

import { pick } from 'remeda'

import { auth } from '@clerk/nextjs/server'
import { AuthObject as ClerkAuthObject } from '@clerk/backend'

import { checkSessionPermissions, CompactPermissions, PermissionKey, SystemPermissionKey, TeamPermissionKey } from '../lib/permissions'


export interface RTPlusAuthObject {
    readonly personId: string
    readonly clerkUserId: string
    readonly teamSlug: string | null
    readonly permissions: CompactPermissions
    
    hasPermission(permission: SystemPermissionKey): boolean
    hasPermission(permission: TeamPermissionKey, teamId: string): boolean
}

interface AuthenticatedOptions {
    requirePerson?: boolean
    requireTeam?: boolean
}


export function createRTPlusAuth(clerkAuth: ClerkAuthObject, options: AuthenticatedOptions = {}): RTPlusAuthObject {
    if(clerkAuth.userId == null) throw new Error("User is not authenticated")

    options = { requirePerson: false, requireTeam: false , ...options}

    const teamSlug = clerkAuth.orgSlug ?? null
    const userPersonId = clerkAuth.sessionClaims.rt_pid ?? null

    if(options.requireTeam && teamSlug == null) throw new Error("User is not associated with a team")
    if(options.requirePerson && userPersonId == null) throw new Error("User is not associated with a person")


    return {
        personId: clerkAuth.sessionClaims.rt_pid,
        clerkUserId: clerkAuth.userId,
        teamSlug,
        permissions: pick(clerkAuth.sessionClaims, ['rt_sp', 'rt_tp']),
        hasPermission(permission: PermissionKey, id?: string): boolean {
            return checkSessionPermissions(clerkAuth.sessionClaims, permission, id)
        }
    } 
}



export async function authenticated(options: AuthenticatedOptions = {}): Promise<RTPlusAuthObject> {

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('server-only');

    const clerkAuth = await auth.protect()

    return createRTPlusAuth(clerkAuth, options)
}
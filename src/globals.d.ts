/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import '@tanstack/react-table'

import type { SessionPermissionClaims, ShortPermissions, SkillPackagePermissionKey, SystemPermissionKey, TeamPermissionKey } from './server/permissions'

declare module '@tanstack/react-table' {
    // eslint-disable-next-line
    interface ColumnMeta<TData extends RowData, TValue> {
        align?: 'left' | 'center' | 'right'
        enumOptions?: Record<string, string>
    }
}

export {}

import '@clerk/nextjs'

declare global {
    interface UserPublicMetadata {
        userPersonId: string
        skillPackagePermissions: Record<string, ShortPermissions>
        systemPermissions: ShortPermissions
        teamPermissions: Record<string, ShortPermissions>
    }
    interface CustomJwtSessionClaims {
        rt_pid: string
        rt_ssp: Record<string, ShortPermissions>
        rt_sp: ShortPermissions
        rt_tp: Record<string, ShortPermissions>
    }
}
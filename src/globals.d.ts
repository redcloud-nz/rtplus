/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import '@tanstack/react-table'

import type { SystemShortPermissions, TeamShortPermissions } from './lib/permissions'

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
        systemPermissions: SystemShortPermissions
        teamPermissions: Record<string, TeamShortPermissions>
    }
    interface CustomJwtSessionClaims {
        org_name: string
        rt_pid: string
        rt_sp: SystemShortPermissions
        rt_tp: Record<string, TeamShortPermissions>
    }
}
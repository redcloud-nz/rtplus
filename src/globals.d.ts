/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import '@tanstack/react-table'

import { PermissionSet } from './lib/permissions'

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
        personId: string
        permissions: PermissionSet
    }
    interface CustomJwtSessionClaims {
        personId: string
        permissions: PermissionSet
    }
}
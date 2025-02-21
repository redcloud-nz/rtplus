/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import '@tanstack/react-table'

import { UserOnboardingStatus } from '@prisma/client'

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
    interface OrganizationPublicMetadata {
        teamId: string
    }
    interface UserPublicMetadata {
        userId: string
        userPersonId: string | undefined
        systemPermissions: SystemShortPermissions
        teamPermissions: Record<string, TeamShortPermissions>
        onboardingStatus: UserOnboardingStatus
    }
    interface CustomJwtSessionClaims {
        org_name: string
        rt_uid: string
        rt_pid: string | undefined
        rt_sp: SystemShortPermissions
        rt_tp: Record<string, TeamShortPermissions>
        rt_uos: UserOnboardingStatus
    }
}
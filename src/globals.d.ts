/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import '@tanstack/react-table'

import { PersonOnboardingStatus, UserOnboardingStatus } from '@prisma/client'

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
        person_id: string
        system_role?: 'admin' | 'none'
        onboarding_status: PersonOnboardingStatus
    }
    interface CustomJwtSessionClaims {
        org_name: string
        org_slug: string
        rt_person_id: string
        rt_system_role?: 'admin' | 'none'
        rt_onboarding_status: UserOnboardingStatus
    }
}
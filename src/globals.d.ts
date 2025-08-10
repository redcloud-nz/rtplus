/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import '@clerk/nextjs'
import '@tanstack/react-table'

declare module '@tanstack/react-table' {
    // eslint-disable-next-line
    interface ColumnMeta<TData extends RowData, TValue> {
        align?: 'left' | 'center' | 'right'
        enumOptions?: Record<string, string>
        slotProps?: {
            th?: Omit<ComponentProps<'th'>, 'children'>
        }
    }
}

declare global {
    interface ClerkAuthorization {
        role: 'org:admin' | 'org:member'
    }

    interface OrganizationPublicMetadata {
        teamId: string
    }
    interface UserPublicMetadata {
        person_id: string
        system_role?: 'admin' | 'none'
        onboarding_status: 'incomplete' | 'complete'
    }
    interface CustomJwtSessionClaims {
        org_name: string
        org_slug: string
        rt_person_id: string
        rt_system_role?: 'admin' | 'none'
        onboarding_status: 'incomplete' | 'complete'
    }
}

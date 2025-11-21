/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { D4hServerCode } from '@/lib/d4h-api/servers'

export const organizationSettingsSchema = z.object({
    defaultPageSize: z.number().min(1).max(100).default(50),
    integrations: z.object({
        d4h: z.object({
            enabled: z.boolean().default(false),
            server: D4hServerCode.schema.default('ap'),
        }).default({ enabled: false, server: 'ap' }),
    }).default({
        d4h: { enabled: false, server: 'ap' }
    }),
    modules: z.object({
        d4hViews: z.object({
            enabled: z.boolean().default(false),
        }).default({ enabled: false }),
        notes: z.object({
            enabled: z.boolean().default(false),
        }).default({ enabled: false }),
        skills: z.object({
            enabled: z.boolean().default(true),
        }).default({ enabled: false }),
        skillPackageManager: z.object({
            enabled: z.boolean().default(false),
        }).default({ enabled: false }),

    })
    
})


export type OrganizationSettingsData = z.infer<typeof organizationSettingsSchema>

export const DefaultOrganizationSettings: OrganizationSettingsData = organizationSettingsSchema.parse({
    integrations: {},
    modules: {}
})

export const userSettingsSchema = z.object({
    
})

export type UserSettingsData = z.infer<typeof userSettingsSchema>

export const DefaultUserSettings: UserSettingsData = userSettingsSchema.parse({})

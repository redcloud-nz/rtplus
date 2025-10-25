/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

export const organizationSettingsSchema = z.object({
    modules: z.object({
        d4h: z.object({
            enabled: z.boolean().default(false),
        }).default({ enabled: false }),
        notes: z.object({
            enabled: z.boolean().default(false),
        }).default({ enabled: false }),
        skills: z.object({
            enabled: z.boolean().default(true),
        }).default({ enabled: false }),
        spm: z.object({
            enabled: z.boolean().default(false),
        }).default({ enabled: false }),

    }).default({}),
    
})

export type OrganizationSettingsData = z.infer<typeof organizationSettingsSchema>

export const DefaultOrganizationSettings: OrganizationSettingsData = organizationSettingsSchema.parse({
    enabledModules: []
})

export const userSettingsSchema = z.object({
    
})

export type UserSettingsData = z.infer<typeof userSettingsSchema>

export const DefaultUserSettings: UserSettingsData = userSettingsSchema.parse({})

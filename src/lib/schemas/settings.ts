/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'
import { enabledModulesSchema } from './modules'


export const organizationSettingsSchema = z.object({
    enabledModules: enabledModulesSchema.default([]),
})

export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>

export const DefaultOrganizationSettings: OrganizationSettings = organizationSettingsSchema.parse({
    enabledModules: []
})

export const userSettingsSchema = z.object({
    
})

export type UserSettings = z.infer<typeof userSettingsSchema>

export const DefaultUserSettings: UserSettings = userSettingsSchema.parse({})
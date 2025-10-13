/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'
import { enabledModulesSchema } from './modules'

const MODULES = ['d4h', 'notes', 'skills'] as const



export const organizationSettingsSchema = z.object({
    enabledModules: enabledModulesSchema,
})

export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>

export const userSettingsSchema = z.object({
    
})

export type UserSettings = z.infer<typeof userSettingsSchema>


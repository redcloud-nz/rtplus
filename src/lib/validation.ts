/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { z } from 'zod'

export const zodColor = z.string().regex(/^#[0-9A-F]{6}$/, "Must be a colour in RGB Hex format (eg #4682B4)")

export const zodRecordStatus = z.union([
    z.enum(['Active', 'Inactive']),
    z.array(z.enum(['Active', 'Inactive'])).min(1).max(2)
]).optional().default(['Active', 'Inactive']).transform(value => Array.isArray(value) ? value : [value])

export const zodSlug = z.string().max(100).regex(/^[a-zA-Z0-9\-]+$/, "Must be url slug format (alphanumeric with hyphens).")

export const zodNanoId8 = z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "Must be 8 character alphanumeric format (no spaces or special characters).")

export const zodNanoId16 = z.string().length(16).regex(/^[a-zA-Z0-9]+$/, "Must be 16 character alphanumeric format (no spaces or special characters).")


export const userIdSchema = z.string().startsWith('user_').max(50).brand<'ClerkUserId'>()

export const orgIdSchema = z.string().startsWith('org_').max(50).brand<'ClerkOrgId'>()


export const propertiesSchema = z.record(z.string(), z.any())

export const recordStatusSchema = z.enum(['Active', 'Inactive'])

export type RecordStatus = z.infer<typeof recordStatusSchema>
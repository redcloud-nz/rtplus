/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { z } from 'zod'

export const zodColor = z.string().regex(/^#[0-9A-F]{6}$/, "Must be a colour in RGB Hex format (eg #4682B4)")

export const zodDeleteType = z.enum(['Soft', 'Hard']).optional().default('Soft')

export const zodRecordStatus = z.union([
    z.enum(['Active', 'Inactive', 'Deleted']),
    z.array(z.enum(['Active', 'Inactive', 'Deleted'])).min(1).max(3)
]).optional().default('Active').transform(value => Array.isArray(value) ? value : [value])

export const zodSlug = z.string().max(100).regex(/^[a-zA-Z0-9\-]+$/, "Must be url slug format (alphanumeric with hyphens).")

export const zodShortId = z.string().length(8).regex(/^[a-zA-Z0-9]+$/, "Must be 8 character alphanumeric format (no spaces or special characters).")

export const zodLongId = z.string().length(16).regex(/^[a-zA-Z0-9]+$/, "Must be 16 character alphanumeric format (no spaces or special characters).")
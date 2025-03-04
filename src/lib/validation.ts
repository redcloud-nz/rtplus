/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { z } from 'zod'

export const zodColor = z.string().regex(/^#[0-9A-F]{6}$/, "Must be a colour in RGB Hex format (eg #4682B4)")

export const zodSlug = z.string().max(100).regex(/^[a-zA-Z0-9\-]+$/, "Must be url slug format (alphanumeric with hyphens).")
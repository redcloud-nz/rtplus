/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'
import { userRefSchema } from './user'


export const updateMetaSchema = z.object({
    createdAt: z.string().datetime().nullable(),
    createdBy: userRefSchema.nullable(),
    updatedAt: z.string().datetime().nullable(),
    updatedBy: userRefSchema.nullable(),
})

export type UpdateMeta = z.infer<typeof updateMetaSchema>
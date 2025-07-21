/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

export const userSchema = z.object({
    userId: z.string(),
    identifier: z.string(),
    name: z.string()
})

export type UserData = z.infer<typeof userSchema>
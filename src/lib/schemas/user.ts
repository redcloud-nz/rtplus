/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { User as UserRecord } from '@prisma/client'

export type UserId = string & z.BRAND<'UserId'>

export const UserId = {
    schema: z.string().startsWith('user_').min(6).max(50).brand<'UserId'>(),
}

export const userSchema = z.object({
    userId: UserId.schema,
    name: z.string().nonempty().max(100),
    email: z.string().email().max(100),
    settings: z.record(z.any()),
})

export function toUserData(record: UserRecord) {
    return userSchema.parse(record)
}

export type UserData = z.infer<typeof userSchema>
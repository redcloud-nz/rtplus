/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { cacheTag } from 'next/cache'
import { cache } from 'react'

import { auth, createClerkClient } from '@clerk/nextjs/server'




export const getClerkClient = cache(() => {
    return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })
})

export { auth as clerkAuth }

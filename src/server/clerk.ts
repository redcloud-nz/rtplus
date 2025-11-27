/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/
import 'server-only'


import { cache } from 'react'

import { ClerkClient, createClerkClient } from '@clerk/backend'



export const getClerkClient = cache((): ClerkClient => {
    return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY as string })
})

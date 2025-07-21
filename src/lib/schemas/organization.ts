/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

export const organizationSchema = z.object({
    orgId: z.string(),
    name: z.string(),
    slug: z.string().nullable()
})

export type OrganizationData = z.infer<typeof organizationSchema>
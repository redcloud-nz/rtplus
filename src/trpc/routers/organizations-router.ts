/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { getOrganization } from '@/server/organization'

import { createTRPCRouter, orgProcedure } from '../init'


export const organizationsRouter = createTRPCRouter({

    getOrganization: orgProcedure
        .query(async ({ input }) => {
            const organization =  await getOrganization(input.orgId)
            return organization
        })
        
})
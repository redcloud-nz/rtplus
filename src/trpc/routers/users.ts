/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { z } from 'zod'

import { OrganizationMembership as ClerkOrganizationMembership } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'

import { OrganizationData, organizationSchema } from '@/lib/schemas/organization'
import { OrgMembershipData, orgMembershipSchema } from '@/lib/schemas/org-membership'
import { UserData, userSchema } from '@/lib/schemas/user'
import { zodNanoId8 } from '@/lib/validation'

import { authenticatedProcedure, createTRPCRouter, systemAdminProcedure, teamAdminProcedure } from '../init'

import { getTeamById } from './teams'
import { getPersonById } from './personnel'

export const usersRouter = createTRPCRouter({

})

/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/
'use server'

import { ClerkClient } from '@clerk/backend'
import { Organization as OrganizationRecord, Person as PersonRecord, User as UserRecord } from '@prisma/client'

import { RTPlusLogger } from '@/lib/logger'
import { PersonId } from '@/lib/schemas/person'

import { clerkAuth, getClerkClient } from './clerk'
import prisma from './prisma'



const logger = new RTPlusLogger('server/init-user')

export async function initUser(args: { userId: string, orgId: string | null}) {
    
    const { userId, orgId } = await clerkAuth.protect()

    if(userId !== args.userId) throw new Error(`'User ID mismatch clientUserId=${args.userId} serverUserId=${userId}`)
    if(orgId !== args.orgId) throw new Error(`'Organization ID mismatch clientOrgId=${args.orgId} serverOrgId=${orgId}`)

    const clerkClient = getClerkClient()

    const user = await ensureUserRecord(userId, clerkClient)

    if(orgId) {
        // The user is signed in to an organization

        // Ensure the organization exists in our database
        const org = await ensureOrgRecord(orgId, clerkClient)

        // Ensure that there is a person record for this user in this organization
        await ensurePersonRecord(user, org.orgId)
    }
}


async function ensureUserRecord(userId: string, clerkClient: ClerkClient): Promise<UserRecord> {
    const user = await prisma.user.findUnique({ where: { userId } })
    if(user) return user

    // User does not exist - fetch from Clerk

    const clerkUser = await clerkClient.users.getUser(userId)
    if(!clerkUser) throw new Error(`Clerk user not found: ${userId}`)

    // Create user using upsert to avoid a potential race condition with webhooks
    const created = await prisma.user.upsert({
        where: { userId },
        create: {
            userId,
            name: clerkUser.firstName + (clerkUser.lastName ? ` ${clerkUser.lastName}` : ''),
            email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
            settings: {},
        },
        update: {
            name: clerkUser.firstName + (clerkUser.lastName ? ` ${clerkUser.lastName}` : ''),
            email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        }
    })
    logger.info(`Created new user record for userId: ${userId}, email: ${created.email}`)

    return created
}


async function ensureOrgRecord(orgId: string, clerkClient: ClerkClient): Promise<OrganizationRecord> {
    const org = await prisma.organization.findUnique({ where: { orgId } })
    if(org) return org

    // Organization does not exist - fetch from Clerk
    const clerkOrg = await clerkClient.organizations.getOrganization({ organizationId: orgId })
    if(!clerkOrg) throw new Error(`Clerk organization not found: ${orgId}`)

    // Create organization using upsert to avoid a potential race condition with webhooks
    const created = await prisma.organization.upsert({
        where: { orgId },
        create: {
            orgId,
            name: clerkOrg.name,
            settings: {}
        },
        update: {
            name: clerkOrg.name,
        }
    })
    logger.info(`Created new organization for orgId: ${orgId}, orgName: ${created.name}`)

    return created
}


export async function ensurePersonRecord(user: UserRecord, orgId: string): Promise<PersonRecord> {
   // Ensure that there is a person record for this user in this organization
   const person = await prisma.person.findFirst({ where: { userId: user.userId, orgId } })
   if(person) return person

   // No person record - see if we can link an existing person by email
   const existing = await prisma.person.updateManyAndReturn({
       where: { email: user.email, orgId, userId: null },
       data: { userId: user.userId }
   })

   if(existing.length !== 0) {
        logger.info(`Linked existing person ${existing[0].personId} to user ${user.userId}`)
        return existing[0]
    }
    // No existing person - create a new one
    const created = await prisma.person.create({
        data: {
            personId: PersonId.create(),
            name: user.name,
            email: user.email,
            userId: user.userId,
            orgId,
            status: 'Active',
            tags: [],
            properties: {},
        }
    })
    logger.info(`Created new person ${created.personId} for user ${user.userId} in org ${orgId}`)
    return created
}
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { NextRequest } from 'next/server'
import { match } from 'ts-pattern'

import { verifyWebhook, WebhookEvent } from '@clerk/nextjs/webhooks'

import { RTPlusLogger } from '@/lib/logger'
import { getClerkClient } from '@/server/clerk'
import prisma from '@/server/prisma'
import { PersonId } from '@/lib/schemas/person'



const logger = new RTPlusLogger('webhooks/clerk')

/**
 * Route to handle Clerk webhooks
 * @param req NextRequest
 * @returns Status 200 if successful, 400 if verification fails, 500 if processing fails
 */
export async function POST(req: NextRequest) {
    
    let event: WebhookEvent
    try {
        event = await verifyWebhook(req)

    } catch (err) {
        logger.error('Error verifying webhook:', err)
        return new Response('Error verifying webhook', { status: 400 })
    }

    try {
        await processWebhook(event)
    } catch (err) {
        logger.error('Error processing webhook:', err)
        return new Response('Error processing webhook', { status: 500 })
    }

    return new Response('Webhook received', { status: 200 })
}


async function processWebhook(event: WebhookEvent) {
    await match(event)
        .with({ type: 'organization.created' }, async ({ data }) => {
            await prisma.organization.upsert({
                where: { orgId: data.id },
                create: {
                    orgId: data.id,
                    name: data.name,
                    settings: {}
                },
                update: {
                    name: data.name,
                }
            })
        })
        .with({ type: 'organization.updated' }, async ({ data }) => {
            await prisma.organization.updateMany({
                where: { orgId: data.id },
                data: {
                    name: data.name,
                }
            })
        })
        .with({ type: 'organization.deleted' }, async ({ data }) => {
            await prisma.organization.deleteMany({
                where: { orgId: data.id },
            })
        })
        .with({ type: 'organizationMembership.created' }, async ({ data }) => {
            const clerkClient = getClerkClient()
            const clerkUser = await clerkClient.users.getUser(data.public_user_data.user_id)
            const email = clerkUser.primaryEmailAddress?.emailAddress || null
            if(email === null) {
                logger.warn(`User ${data.public_user_data.user_id} has no primary email address, cannot link to person records`)
                return
            }

            // If there is a person with this email in this org, link them to the user
            await prisma.person.updateMany({
                where: { email: email, orgId: data.organization.id, userId: null },
                data: {
                    userId: clerkUser.id
                }
            })

            const existing = await prisma.person.updateManyAndReturn({
                where: { email, orgId: data.organization.id, userId: null },
                data: { userId: clerkUser.id }
            })

            if(existing.length !== 0) {
                logger.info(`Linked existing person ${existing[0].personId} to user ${clerkUser.id}`)
                return
            }
            // No existing person - create a new one
            const created = await prisma.person.create({
                data: {
                    personId: PersonId.create(),
                    name: clerkUser.firstName + (clerkUser.lastName ? ` ${clerkUser.lastName}` : ''),
                    email: email,
                    userId: clerkUser.id,
                    orgId: data.organization.id,
                    status: 'Active',
                    tags: [],
                    properties: {},
                }
            })

        })
        .with({ type: 'organizationMembership.updated' }, async ({ data }) => {
            // Nothing to do here for now
            

        })
        .with({ type: 'organizationMembership.deleted' }, async ({ data }) => {
            // Disconnect the user from person records in this org
            await prisma.person.updateMany({
                where: { userId: data.public_user_data.user_id, orgId: data.organization.id },
                data: {
                    userId: null
                }
            })

        })
        .with({ type: 'user.created' }, async ({ data }) => {
            await prisma.user.upsert({
                where: { userId: data.id },
                create: {
                    userId: data.id,
                    name: data.first_name + (data.last_name ? ` ${data.last_name}` : ''),
                    email: data.email_addresses?.[0]?.email_address || '',
                    settings: {},
                },
                update: {
                    name: data.first_name + (data.last_name ? ` ${data.last_name}` : ''),
                    email: data.email_addresses?.[0]?.email_address || '',
                }
            })

        })
        .with({ type: 'user.updated' }, async ({ data }) => {
            await prisma.user.update({
                where: { userId: data.id },
                data: {
                    name: data.first_name + (data.last_name ? ` ${data.last_name}` : ''),
                    email: data.email_addresses?.[0]?.email_address || '',
                }
            })

        })
        .with({ type: 'user.deleted' }, async ({ data }) => {
            await prisma.user.update({
                where: { userId: data.id },
                data: {
                    deleted: true,
                }
            })
        })
        .otherwise(() => {
            logger.warn(`Unhandled webhook event: ${event.type}, id: ${event.data.id}`)
        })

        logger.info(`Processed webhook event: ${event.type}, id: ${event.data.id}`)
}
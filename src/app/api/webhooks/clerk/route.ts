/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { NextRequest } from 'next/server'
import { match } from 'ts-pattern'

import { verifyWebhook, WebhookEvent } from '@clerk/nextjs/webhooks'

import prisma from '@/server/prisma'
import { RTPlusLogger } from '@/lib/logger'

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
        .with({ type: 'organizationMembership.created' }, ({ data }) => {

        })
        .with({ type: 'organizationMembership.updated' }, ({ data }) => {

        })
        .with({ type: 'organizationMembership.deleted' }, ({ data }) => {

        })
        .with({ type: 'user.created' }, ({ data }) => {

        })
        .with({ type: 'user.updated' }, ({ data }) => {

        })
        .with({ type: 'user.deleted' }, ({ data }) => {

        })
        .otherwise(() => {
            logger.warn(`Unhandled webhook event: ${event.type}, id: ${event.data.id}`)
        })

        logger.info(`Processed webhook event: ${event.type}, id: ${event.data.id}`)
}
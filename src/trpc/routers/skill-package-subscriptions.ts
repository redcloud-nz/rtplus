/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { skillSchema } from '@/lib/schemas/skill'
import { SkillGroupId, skillGroupSchema } from '@/lib/schemas/skill-group'
import { skillPackageRefSchema, skillPackageSchema, toSkillPackageData, toSkillPackageRef } from '@/lib/schemas/skill-package'
import { skillPackageSubscriptionGroupSchema, skillPackageSubscriptionSchema, toSkillPackageSubscriptionData, toSkillPackageSubscriptionGroupData } from '@/lib/schemas/skill-package-subscription'
import { TRPCError } from '@trpc/server'

import { createTRPCRouter, orgAdminProcedure, orgProcedure } from '../init'
import { Messages } from '../messages'





/**
 * TRPC router for managing skill package subscriptions.
 */
export const skillPackageSubscriptionsRouter = createTRPCRouter({

    /**
     * Create a new skill package subscription.
     */
    createSubscription: orgAdminProcedure
        .input(skillPackageSubscriptionSchema.extend({
            groups: z.array(skillPackageSubscriptionGroupSchema)
        }))
        .output(skillPackageSubscriptionSchema.extend({
            groups: z.array(skillPackageSubscriptionGroupSchema)
        }))
        .mutation(async ({ ctx, input: { orgId, skillPackageId, subscriptionId, ...fields } }) => {

            const skillPackage = await ctx.prisma.skillPackage.findUnique({
                where: { skillPackageId, published: true },
                include: {
                    skillGroups: true
                }
            })
            if(!skillPackage) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.skillPackageNotFound(skillPackageId) })

            // Check if a subscription already exists
            const existingSubscription = await ctx.prisma.skillPackageSubscription.findFirst({
                where: { orgId, skillPackageId }
            })
            if(existingSubscription) {
                throw new TRPCError({ code: 'CONFLICT', message: `Subscription already exists for SkillPackage(${skillPackageId}) in Organization(${orgId}).` })
            }

            // Gather the skill group IDs from the skill package
            const groupIds = skillPackage.skillGroups.map(group => group.skillGroupId)

            const groups = fields.groups.filter(g => groupIds.includes(g.skillGroupId))

            // Ensure all skill groups are represented in the subscription
            for(const skillGroupId of groupIds) {
                if(!groups.find(g => g.skillGroupId === skillGroupId)) {
                    groups.push({ skillGroupId: skillGroupId as SkillGroupId, include: false })
                }
            }

            // Create the subscription and log the event in a transaction
            const [createdSubscription] = await ctx.prisma.$transaction([
                ctx.prisma.skillPackageSubscription.create({
                    data: {
                        orgId,
                        subscriptionId,
                        skillPackageId,
                        status: fields.status,
                        groups: {
                            createMany: {
                                data: groupIds.map(skillGroupId => ({
                                    skillGroupId,
                                    include: true,
                                }))
                            }
                        }
                    },
                    include: { groups: true }
                }),
                ctx.prisma.organizationChangeLog.create({
                    data: {
                        orgId,
                        userId: ctx.auth.userId,
                        event: 'SkillPackageSubscribe',
                        meta: { skillPackageId }
                    },
                })
            ])

            return { ... toSkillPackageSubscriptionData(createdSubscription), groups: createdSubscription.groups.map(toSkillPackageSubscriptionGroupData) }
        }),


    /**
     * Delete a skill package subscription.
     */
    deleteSubscription: orgAdminProcedure
        .input(skillPackageSubscriptionSchema.pick({ subscriptionId: true }))
        .mutation(async ({ ctx, input: { subscriptionId, orgId } }) => {

            const subscription = await ctx.prisma.skillPackageSubscription.findUnique({
                where: { orgId, subscriptionId }
            })
            
            if(!subscription) throw new TRPCError({ code: 'NOT_FOUND', message: Messages.skillPackageNotFound(subscriptionId) })

            await ctx.prisma.$transaction([
                ctx.prisma.skillPackageSubscription.delete({
                    where: { orgId, subscriptionId }
                }),
                ctx.prisma.organizationChangeLog.create({
                    data: {
                        orgId,
                        userId: ctx.auth.userId,
                        event: 'SkillPackageUnsubscribe',
                        meta: { skillPackageId: subscription.skillPackageId }
                    },
                })
            ])
        }),

    /**
     * List all skillss
     */
    listSubscribedSkillPackages: orgProcedure
        .output(z.array(skillPackageSchema.extend({
            subscription: skillPackageSubscriptionSchema,
            skillGroups: z.array(skillGroupSchema),
            skills: z.array(skillSchema)
        })))
        .query(async ({ ctx, input }) => {
            
            const subscriptions = await ctx.prisma.skillPackageSubscription.findMany({
                where: {
                    orgId: ctx.auth.activeOrg.orgId,
                    status: 'Active',
                },
                include: {
                    skillPackage: {
                        include: {
                            skillGroups: {
                                orderBy: { sequence: 'asc' }
                            },
                            skills: {
                                orderBy: { sequence: 'asc' }
                            }
                        }
                    },
                    groups: true,
                },
            })
                   
            return subscriptions.map(({ skillPackage, groups, ...subscription  }) => ({
                ...toSkillPackageData(skillPackage),
                subscription: toSkillPackageSubscriptionData({ ...subscription }),
                skillGroups: skillPackage.skillGroups.flatMap(skillGroup => {
                        const groupSubscription = groups.find(g => g.skillGroupId === skillGroup.skillGroupId)
                        
                        // Only include the skill group if it is included in the subscription
                        if(groupSubscription?.included !== true) return []

                        return [{
                            ...skillGroupSchema.parse(skillGroup),
                            subscription: skillPackageSubscriptionGroupSchema.parse(groupSubscription ?? {
                                skillGroupId: skillGroup.skillGroupId,
                                include: false,
                            })
                        }]
                    }),
                skills: skillPackage.skills.map(skill => skillSchema.parse(skill))

            }))
        }),


    listSubscriptions: orgAdminProcedure
        .output(z.array(skillPackageSubscriptionSchema.extend({ skillPackage: skillPackageRefSchema })))
        .query(async ({ ctx, input }) => {

        const subscriptions = await ctx.prisma.skillPackageSubscription.findMany({
            where: {
                orgId: ctx.auth.activeOrg.orgId,
            },
            include: {
                skillPackage: {
                    include: {
                        skillGroups: true
                    }
                },
                groups: true
            }
        })

        return subscriptions.map(({ skillPackage, ...subscription }) => {

            const skillGroups = skillPackage.skillGroups
            const groupSubscriptions = subscription.groups

            // Ensure all skill groups are represented in the subscription
            for(const skillGroup of skillGroups) {
                if(!groupSubscriptions.find(g => g.skillGroupId === skillGroup.skillGroupId)) {
                    groupSubscriptions.push({ subscriptionId: subscription.subscriptionId, skillGroupId: skillGroup.skillGroupId, included: false })
                }
            }

            return { 
                ...toSkillPackageSubscriptionData(subscription), 
                skillPackage: toSkillPackageRef(skillPackage)
            }
        })
    }),
})
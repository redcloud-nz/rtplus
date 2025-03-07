/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import * as R from 'remeda'
import { z } from 'zod'

import { clerkClient } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'

import { createTeamFormSchema } from '@/lib/forms/create-team'
import { createUUID } from '@/lib/id'

import { updateTeamFormSchema } from '@/lib/forms/update-team'
import { RTPlusLogger } from '@/lib/logger'
import { zodSlug } from '@/lib/validation'

import { authenticatedProcedure, createTRPCRouter, systemAdminProcedure, teamAdminProcedure } from '../init'
import { FieldConflictError } from '../types'


const logger = new RTPlusLogger('trpc/teams')

export const teamsRouter = createTRPCRouter({
    addMember_ExistingPerson: systemAdminProcedure
        .input(z.object({
            teamId: z.string().uuid(),
            personId: z.string().uuid()
        }))
        .mutation(async ({ ctx, input }) => {

            const memberExists = await ctx.prisma.teamMembership.findFirst({ where: { teamId: input.teamId, personId: input.personId } })
            if(memberExists) throw new TRPCError({ code: 'CONFLICT', message: 'Member already exists in team' })

            await ctx.prisma.$transaction([
                ctx.prisma.teamMembership.create({
                    data: {
                        teamId: input.teamId,
                        personId: input.personId,
                    }
                }),
                ctx.prisma.teamChangeLog.create({
                    data: {
                        teamId: input.teamId,
                        actorId: ctx.personId,
                        event: 'AddMember',
                        fields: { personId: input.personId }
                    }
                })
            ])
        }),
    addMember_NewPerson: systemAdminProcedure
        .input(z.object({
            teamId: z.string().uuid(),
            name: z.string().nonempty(),
            email: z.string().email()
        }))
        .output(z.object({
            personId: z.string().uuid(),
            personName: z.string().optional(),
            status: z.enum(['AddedPersonAndMember', 'PersonAlreadyExists', 'MemberAlreadyExists'])
        }))
        .mutation(async ({ ctx, input }) => {

            const existing = await ctx.prisma.person.findFirst({ where: { email: input.email } })
            if(existing) {
                const memberExists = await ctx.prisma.teamMembership.findFirst({ where: { teamId: input.teamId, personId: existing.id } })
                if(memberExists) return { personId: existing.id, personName: existing.name, status: 'MemberAlreadyExists' }
                else return { personId: existing.id, personName: existing.name, status: 'PersonAlreadyExists' }
            }

            const person = await ctx.prisma.person.create({
                data: {
                    name: input.name,
                    email: input.email,
                    changeLogs: {
                        create: {
                            actorId: ctx.personId,
                            event: 'Create',
                            fields: { name: input.name, email: input.email, onboardingStatus: 'NotStarted' }
                        }
                    }
                }
            })

            return { personId: person.id, status: 'AddedPersonAndMember' }
        }),

    all: authenticatedProcedure
        .input(z.object({
            includeD4hInfo: z.boolean().optional().default(false)
        }).optional().default({}))
        .query(async ({ ctx, input = {} }) => {
            return await ctx.prisma.team.findMany({ 
                where: { status: 'Active' },
                include: {
                    ... (input.includeD4hInfo ? { d4hInfo: true } : {}),
                    _count: {
                        select: { teamMemberships: true }
                    }
                },
            })
        }),

    allLinkedToD4h: authenticatedProcedure
        .query(async ({ ctx }) => {
            const teams = await ctx.prisma.team.findMany({
                where: { status: 'Active' },
                include: { d4hInfo: true }
            })
            return teams.filter(team => team.d4hInfo != null )
        }),
    byId: authenticatedProcedure
        .input(z.object({ 
            teamId: z.string().uuid()
        }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.team.findUnique({ 
                where: { id: input.teamId },
                include: { d4hInfo: true }
            })
        }),
    bySlug: authenticatedProcedure
        .input(z.object({
            slug: zodSlug
        }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.team.findUnique({ 
                where: { slug: input.slug },
                include: { d4hInfo: true }
            })
        }),

    create: systemAdminProcedure
        .input(createTeamFormSchema)
        .mutation(async ({ ctx, input }) => {

            const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
            if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })

            const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
            if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })

            const slugConflict = await ctx.prisma.team.findFirst({ where: { slug: input.slug } })
            if(slugConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('slug') })
            
            const clerk = await clerkClient()

            const teamId = createUUID()

            const organization = await clerk.organizations.createOrganization({
                name: input.name,
                slug: input.slug,
                publicMetadata: { teamId }
            })


            return await ctx.prisma.team.create({ 
                data: { 
                    ...input, id: teamId, clerkOrgId: organization.id,
                    changeLogs: { 
                        create: { 
                            actorId: ctx.personId,
                            event: 'Create',
                            fields: input
                        }
                    }
                }
            })
        }),
    
    membersById: authenticatedProcedure
        .input(z.object({
            teamId: z.string().uuid()
        }))
        .query(async ({ ctx, input }) => {

            return await ctx.prisma.teamMembership.findMany({
                include: {
                    person: true,
                    d4hInfo: true
                },
                where: { teamId: input.teamId },
                orderBy: {
                    person: { name: 'asc' }
                }
            })
        }),
    membersBySlug: authenticatedProcedure
        .input(z.object({
            slug: zodSlug
        }))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.teamMembership.findMany({
                include: {
                    person: { select: { id: true, name: true } },
                    d4hInfo: { select: { position: true } }
                },
                where: { team: { slug: input.slug } },
                orderBy: {
                    person: { name: 'asc' }
                }
            })
        }),

    updateTeam: systemAdminProcedure
        .input(updateTeamFormSchema)
        .mutation(async ({ ctx, input }) => {
            
            const existing = await ctx.prisma.team.findUnique({ where: { id: input.id }})
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            if(input.name != existing.name) {
                const nameConflict = await ctx.prisma.team.findFirst({ where: { name: input.name } })
                if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })
            }

            if(input.shortName != existing.shortName) {
                const shortNameConflict = await ctx.prisma.team.findFirst({ where: { shortName: input.shortName } })
                if(shortNameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('shortName') })
            }
            
            if(input.slug != existing.slug) {
                const slugConflict = await ctx.prisma.team.findFirst({ where: { slug: input.slug } })
                if(slugConflict) throw new TRPCError({ code: 'CONFLICT', cause:new FieldConflictError('slug') })
            }


            const { id, ...data } = input

            const changedFields = R.pickBy(data, (value, key) => value != existing[key])
            
            return await ctx.prisma.team.update({ 
                where: { id },
                data: { 
                    ...data,
                    changeLogs: { 
                        create: { 
                            actorId: ctx.personId,
                            event: 'Update',
                            fields: { changedFields }
                        }
                    }
                } 
            })
        }),

    updateTeamD4h: systemAdminProcedure
        .input(z.object({
            teamId: z.string().uuid(),
            d4hTeamId: z.number(),
            serverCode: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { teamId, ...data } = input

            logger.info(`Updating D4H info for team ${teamId}`, input)

            const existing = await ctx.prisma.team.findUnique({ where: { id: teamId }})
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            await ctx.prisma.team.update({
                where: { id: teamId },
                data: { 
                    d4hInfo: {
                        upsert: {
                            create: data,
                            update: data
                        }
                    }
                }
            })
        }),
})
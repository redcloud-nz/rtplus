/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { authenticatedProcedure, AuthenticatedContext, createTRPCRouter } from '../init'
import { SystemPermissionKey, TeamPermissionKey } from '@/lib/permissions'

export async function getPersonPermissions(ctx: AuthenticatedContext, personId: string) {
    const person = await ctx.prisma.person.findUnique({
        where: { id: personId },
        include: {
            teamPermissions: {
                include: {
                    team: {
                        select: { id: true, name: true, shortName: true, slug: true, status: true }
                    }
                }
            },
            systemPermissions: true,
        }
    })

    if(person === null) throw new TRPCError({ code: 'NOT_FOUND' })

    return {
        systemPermissions: (person.systemPermissions?.permissions ?? []) as SystemPermissionKey[],
        teamPermissions: person.teamPermissions.map(({ team, permissions }) => ({ team, permissions: permissions as TeamPermissionKey[] }))
    }
}

export const permissionsRouter = createTRPCRouter({

    person: authenticatedProcedure
        .input(z.object({ personId: z.string().uuid() }))
        .query(({ input, ctx }) => getPersonPermissions(ctx, input.personId)),

    addPermission: authenticatedProcedure
        .input(z.object({ personId: z.string().uuid(), permissionKey: z.string(), objectId: z.string().uuid().optional() }))
        .mutation(async ({ input, ctx }) => {
            const { personId, permissionKey } = input

            if(permissionKey === 'system:write') {
                // Only people with system:write permission can assign system:write permission
                if(!ctx.hasPermission('system:write')) throw new TRPCError({ code: 'FORBIDDEN' })

                await ctx.prisma.systemPermission.upsert({
                    where: { personId: personId },
                    create: { permissions: ['system:write'], person: { connect: { id: personId }} },
                    update: { permissions: { push: 'system:write' } }
                })
            } else if(input.permissionKey.startsWith('team:')) {
                const teamId = input.objectId
                
                if(!teamId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Team ID is required for team permissions' })
                
                // Only people with team:write permission (for the team) or system:write can assign team permissions
                if(!(ctx.hasPermission('team:write', teamId) || ctx.hasPermission('system:write'))) throw new TRPCError({ code: 'FORBIDDEN' })
               
                await ctx.prisma.teamPermission.upsert({
                    where: { 
                        personId_teamId: { personId, teamId }
                    },
                    create: { 
                        permissions: [permissionKey], 
                        person: { connect: { id: personId }}, 
                        team: { connect: { id: teamId }}
                    },
                    update: { 
                        permissions: { push: permissionKey }
                    }
                })
            }
        }),

    removePermission: authenticatedProcedure
        .input(z.object({ personId: z.string().uuid(), permissionKey: z.string(), objectId: z.string().uuid().optional() }))
        .mutation(async ({ input, ctx }) => {
            const { personId, permissionKey } = input

            if(permissionKey === 'system:write') {
                // Only people with system:write permission can remove system:write permission
                if(!ctx.hasPermission('system:write')) throw new TRPCError({ code: 'FORBIDDEN' })

                const existing = await ctx.prisma.systemPermission.findUnique({ where: { personId }})

                if(existing) {
                    await ctx.prisma.systemPermission.update({
                        where: { personId },
                        data: { permissions: { set: existing.permissions.filter(p => p !== 'system:write') }}
                    })
                }
                
            } else if(permissionKey.startsWith('team')) {
                const teamId = input.objectId
                if(!teamId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Team ID is required for team permissions' })

                // Only people with team:write permission (for the team) or system:write can remove team permissions
                if(!(ctx.hasPermission('team:write', teamId) || ctx.hasPermission('system:write'))) throw new TRPCError({ code: 'FORBIDDEN' })

                const existing = await ctx.prisma.teamPermission.findUnique({
                    where: { 
                        personId_teamId: { personId, teamId }
                    },
                })

                if(existing) {
                    await ctx.prisma.teamPermission.update({
                        where: { 
                            personId_teamId: { personId, teamId }
                        },
                        data: { permissions: { set: existing.permissions.filter(p => p !== permissionKey) }}
                    })
                }
            }
        })
})
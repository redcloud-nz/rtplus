/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import * as R from 'remeda'
import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { authenticatedProcedure, AuthenticatedContext, createTRPCRouter } from '../init'
import { isSystemPermission, isTeamPermission, PermissionKey, SystemPermissionKey, TeamPermissionKey } from '@/lib/permissions'
import { clerkClient } from '@clerk/nextjs/server'

export const permissionsRouter = createTRPCRouter({
    person: authenticatedProcedure
        .input(z.object({ personId: z.string().uuid() }))
        .query(({ input, ctx }) => getPersonPermissions(ctx, input.personId)),

    addPermission: authenticatedProcedure
        .input(z.object({ 
            personId: z.string().uuid(), 
            permissionKey: z.string().transform(p => p as PermissionKey), 
            teamId: z.string().uuid().optional()
        }))
        .mutation(async ({ input, ctx }) => {
            const { personId, permissionKey, teamId } = input
            
            const person = await ctx.prisma.person.findUnique({ where: { id: personId }})
            if(!person) throw new TRPCError({ code: 'NOT_FOUND', message: 'Person not found' })

            if(isSystemPermission(permissionKey)) {
                // Only people with system:write permission can assign system permission
                if(!ctx.hasPermission('system:write')) throw new TRPCError({ code: 'FORBIDDEN' })

                await ctx.prisma.person.update({
                    where: { id: personId },
                    data: { systemPermissions: { push: permissionKey }}
                })

            } else if(isTeamPermission(permissionKey)) {
                
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
        .input(z.object({ 
            personId: z.string().uuid(), 
            permissionKey: z.string().transform(p => p as PermissionKey), 
            teamId: z.string().uuid().optional() 
        }))
        .mutation(async ({ input, ctx }) => {
            const { personId, permissionKey, teamId } = input

            if(isSystemPermission(permissionKey)) {
                // Only people with system:write permission can remove system permissions
                if(!ctx.hasPermission('system:write')) throw new TRPCError({ code: 'FORBIDDEN' })

                const existing = await ctx.prisma.person.findUnique({ 
                    where: { id: personId },
                    select: { systemPermissions: true }
                })

                if(existing) {
                    await ctx.prisma.person.update({
                        where: { id: personId },
                        data: { systemPermissions: { set: existing.systemPermissions.filter(p => p !== permissionKey) }}
                    })
                }
                
            } else if(isTeamPermission(permissionKey)) {
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

export async function getPersonPermissions(ctx: AuthenticatedContext, personId: string) {

    const [person, teamPermissions] = await Promise.all([
        ctx.prisma.person.findUnique({
            where: { id: personId, status: 'Active' },
        }),
        ctx.prisma.teamPermission.findMany({
            where: { personId, team: { status: 'Active' } },
            include: { team: true }
        })
    ])

    return {
        systemPermissions: (person?.systemPermissions ?? []) as SystemPermissionKey[],
        teamPermissions: teamPermissions.map(({ team, permissions }) => ({ 
            team: R.pick(team, ['id', 'name', 'shortName', 'slug']),
            permissions: permissions as TeamPermissionKey[]
        }))
    }
}
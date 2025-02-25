/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import * as R from 'remeda'
import { z } from 'zod'

import { TRPCError } from '@trpc/server'

import { authenticatedProcedure, AuthenticatedContext, createTRPCRouter } from '../init'
import { isSystemPermission, isTeamPermission, PermissionKey, SystemPermissionKey, TeamPermissionKey } from '@/lib/permissions'

export async function getUserPermissions(ctx: AuthenticatedContext, userId: string) {

    const [user, teamPermissions] = await Promise.all([
        ctx.prisma.user.findUnique({
            where: { id: userId, status: 'Active' },
        }),
        ctx.prisma.teamPermission.findMany({
            where: { userId, team: { status: 'Active' } },
            include: { team: true }
        })
    ])

    return {
        systemPermissions: (user?.systemPermissions ?? []) as SystemPermissionKey[],
        teamPermissions: teamPermissions.map(({ team, permissions }) => ({ 
            team: R.pick(team, ['id', 'name', 'shortName', 'slug']),
            permissions: permissions as TeamPermissionKey[]
        }))
    }
}

export const permissionsRouter = createTRPCRouter({
    user: authenticatedProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .query(({ input, ctx }) => getUserPermissions(ctx, input.userId)),

    addPermission: authenticatedProcedure
        .input(z.object({ 
            userId: z.string().uuid(), 
            permissionKey: z.string().transform(p => p as PermissionKey), 
            teamId: z.string().uuid().optional()
        }))
        .mutation(async ({ input, ctx }) => {
            const { userId, permissionKey, teamId } = input
            

            if(isSystemPermission(permissionKey)) {
                // Only people with system:write permission can assign system permission
                if(!ctx.hasPermission('system:write')) throw new TRPCError({ code: 'FORBIDDEN' })

                await ctx.prisma.user.update({
                    where: { id: userId },
                    data: { systemPermissions: { push: permissionKey }}
                })

            } else if(isTeamPermission(permissionKey)) {
                
                if(!teamId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Team ID is required for team permissions' })
                
                // Only people with team:write permission (for the team) or system:write can assign team permissions
                if(!(ctx.hasPermission('team:write', teamId) || ctx.hasPermission('system:write'))) throw new TRPCError({ code: 'FORBIDDEN' })
               
                await ctx.prisma.teamPermission.upsert({
                    where: { 
                        userId_teamId: { userId, teamId }
                    },
                    create: { 
                        permissions: [permissionKey], 
                        user: { connect: { id: userId }}, 
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
            userId: z.string().uuid(), 
            permissionKey: z.string().transform(p => p as PermissionKey), 
            teamId: z.string().uuid().optional() 
        }))
        .mutation(async ({ input, ctx }) => {
            const { userId, permissionKey, teamId } = input

            if(isSystemPermission(permissionKey)) {
                // Only people with system:write permission can remove system permissions
                if(!ctx.hasPermission('system:write')) throw new TRPCError({ code: 'FORBIDDEN' })

                const existing = await ctx.prisma.user.findUnique({ 
                    where: { id: userId },
                    select: { systemPermissions: true }
                })

                if(existing) {
                    await ctx.prisma.user.update({
                        where: { id: userId },
                        data: { systemPermissions: { set: existing.systemPermissions.filter(p => p !== permissionKey) }}
                    })
                }
                
            } else if(isTeamPermission(permissionKey)) {
                if(!teamId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Team ID is required for team permissions' })

                // Only people with team:write permission (for the team) or system:write can remove team permissions
                if(!(ctx.hasPermission('team:write', teamId) || ctx.hasPermission('system:write'))) throw new TRPCError({ code: 'FORBIDDEN' })

                const existing = await ctx.prisma.teamPermission.findUnique({
                    where: { 
                        userId_teamId: { userId, teamId }
                    },
                })

                if(existing) {
                    await ctx.prisma.teamPermission.update({
                        where: { 
                            userId_teamId: { userId, teamId }
                        },
                        data: { permissions: { set: existing.permissions.filter(p => p !== permissionKey) }}
                    })
                }
            }
        })
})
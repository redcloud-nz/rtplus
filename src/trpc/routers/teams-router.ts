/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { pick, pickBy, pipe } from 'remeda'
import { z } from 'zod'

import { Team as TeamRecord } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { TeamId, teamSchema, toTeamData } from '@/lib/schemas/team'
import { RTPlusLogger } from '@/lib/logger'
import { zodRecordStatus } from '@/lib/validation'

import { AuthenticatedOrgContext, createTRPCRouter, orgAdminProcedure, orgProcedure } from '../init'
import { FieldConflictError } from '../types'


const logger = new RTPlusLogger('trpc/teams')

export const teamsRouter = createTRPCRouter({

    createTeam: orgAdminProcedure
        .input(teamSchema)
        .output(teamSchema)
        .mutation(async ({ ctx, input: { teamId, ...fields } }) => {
            
            const nameConflict = await ctx.prisma.team.findFirst({ where: { name: fields.name } })
            if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })

            const createdTeam = await ctx.prisma.team.create({ 
                data: { 
                    teamId,
                    orgId: ctx.auth.activeOrg.orgId,
                    ...fields, 
                    changeLogs: { 
                        create: { 
                            actorId: ctx.auth.userId,
                            event: 'Create',
                            fields: fields
                        }
                    }
                }
            })

            return toTeamData(createdTeam)
        }),

    deleteTeam: orgAdminProcedure
        .input(z.object({ 
            teamId: TeamId.schema,
        }))
        .output(teamSchema)
        .mutation(async ({ ctx, input: { teamId } }) => {

            const team = await getTeamById(ctx, teamId)

            const deleted = await ctx.prisma.team.delete({ where: { teamId } })

            logger.info(`Team deleted by ${ctx.auth.userId}:`, pick(deleted, ['teamId', 'name']))

            return toTeamData(deleted)
        }),

    getTeam: orgProcedure
        .input(z.object({ 
            teamId: TeamId.schema,
        }))
        .output(teamSchema)
        .query(async ({ ctx, input: { teamId } }) => {

            const team = await getTeamById(ctx, teamId)
            return toTeamData(team)
        }),

    getTeams: orgProcedure
        .input(z.object({
            status: zodRecordStatus
        }).optional().default({}))
        .output(z.array(teamSchema.extend({
            _count: z.object({
                teamMemberships: z.number()
            })
        })))
        .query(async ({ ctx, input }) => {
            const found = await ctx.prisma.team.findMany({ 
                where: {
                    orgId: ctx.auth.activeOrg.orgId,
                    status: { in: input.status, },
                },
                include: {
                    _count: {
                        select: { teamMemberships: true }
                    }
                },
                orderBy: { name: 'asc' }
            })

            return found.map(team => ({ ...toTeamData(team), _count: team._count }))
        }),
            

    updateTeam: orgAdminProcedure
        .input(teamSchema)
        .output(teamSchema)
        .mutation(async ({ ctx, input: { teamId, ...fields } }) => {

            const team = await getTeamById(ctx, teamId)

            if(fields.name != team.name) {
                const nameConflict = await ctx.prisma.team.findFirst({ where: { orgId: ctx.auth.activeOrg.orgId, name: fields.name } })
                if(nameConflict) throw new TRPCError({ code: 'CONFLICT', cause: new FieldConflictError('name') })
            }

            // Pick only the fields that have changed
            const changedFields = pipe(fields, pick(['color', 'name', 'status']), pickBy((value, key) => value != team[key]))

            if(Object.keys(changedFields).length > 0) {
                const updated = await ctx.prisma.team.update({
                    where: { teamId },
                    data: { 
                        ...changedFields,
                        changeLogs: { 
                            create: { 
                                actorId: ctx.auth.userId,
                                event: 'Update',
                                fields: changedFields
                            }
                        }
                    }
                })

                return toTeamData(updated)
            } else {
                return toTeamData(team)
            }
        }),

    updateTeamD4h: orgAdminProcedure
        .input(z.object({
            teamId: TeamId.schema,
            d4hTeamId: z.number(),
            serverCode: z.string(),
        }))
        .mutation(async ({ ctx, input: { teamId, ...data } }) => {

            const existing = await getTeamById(ctx, teamId)
            if(!existing) throw new TRPCError({ code: 'NOT_FOUND' })

            await ctx.prisma.team.update({
                where: { teamId },
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


/**
 * Gets a team by its ID.
 * @param ctx The authenticated context.
 * @param teamId The ID of the team to retrieve.
 * @returns The team object if found.
 * @throws TRPCError if the team is not found.
 */
export async function getTeamById(ctx: AuthenticatedOrgContext, teamId: TeamId): Promise<TeamRecord> {
    const team = await ctx.prisma.team.findUnique({ 
        where: { teamId, orgId: ctx.auth.activeOrg.orgId },
    })
    if(!team) throw new TRPCError({ code: 'NOT_FOUND', message: `Team with ID '${teamId}' not found.` })
    return team
}
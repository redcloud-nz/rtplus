/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { getClerkClient } from '@/server/clerk'
import { authenticatedProcedure, createTRPCRouter } from '../init'
import { toUserData, userSchema } from '@/lib/schemas/user'


export const usersRouter = createTRPCRouter({

    getCurrentUser: authenticatedProcedure
        .output(userSchema)
        .query(async ({ ctx }) => {

            // Find the user record
            let user = await ctx.prisma.user.findUnique({
                where: { userId: ctx.auth.userId }
            })

            if(!user) {
                const clerk = getClerkClient()
                const clerkUser = await clerk.users.getUser(ctx.auth.userId)

                user = await ctx.prisma.user.create({
                    data: {
                        userId: ctx.auth.userId,
                        email: clerkUser.primaryEmailAddress?.emailAddress || '',
                        name: clerkUser.fullName || clerkUser.id,
                    }
                })
            }

            return toUserData(user)
        })
})
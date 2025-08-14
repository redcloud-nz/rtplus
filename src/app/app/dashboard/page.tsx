/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app
 */

import { redirect } from 'next/navigation'

import { auth } from '@clerk/nextjs/server'

import * as Paths from '@/paths'



export default async function DashboardRedirectPage() {

    const { sessionClaims } = await auth.protect()

    if(sessionClaims.org_slug) redirect(Paths.team(sessionClaims.org_slug).index)
    redirect(Paths.selectTeam.index)
}
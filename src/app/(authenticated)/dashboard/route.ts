/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { redirect } from 'next/navigation'

import * as Paths from '@/paths'
import { clerkAuth } from '@/server/clerk'


/**
 * GET /dashboard
 *
 * If the user is signed in to an organization.
 */
export async function GET(req: Request) {
    const { orgSlug } = await clerkAuth()

    if (orgSlug) redirect(Paths.org(orgSlug).dashboard.href)

    else redirect(Paths.orgs.select.href)
}
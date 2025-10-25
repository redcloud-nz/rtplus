/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */


import { NextResponse } from 'next/server'

import * as Paths from '@/paths'
import { clerkAuth } from '@/server/clerk'

/**
 * GET /dashboard
 *
 * If the user is signed in to an organization.
 */
export async function GET(req: Request) {
    const { orgSlug } = await clerkAuth()

    if (orgSlug) return NextResponse.redirect(Paths.org(orgSlug).dashboard.href)


    // No organization found — let the caller handle rendering the dashboard/onboarding.
    // Returning 204 keeps this route lightweight; change to a different redirect if desired.
    return new Response(null, { status: 204 });
}
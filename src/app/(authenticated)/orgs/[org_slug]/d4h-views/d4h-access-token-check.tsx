/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { Alert } from '@/components/ui/alert'
import { TextLink } from '@/components/ui/link'
import { D4hAccessTokens, extractUniqueTeams } from '@/lib/d4h-access-tokens'
import { OrganizationData } from '@/lib/schemas/organization'
import { UserId } from '@/lib/schemas/user'
import * as Paths from '@/paths'




export function D4HAccessTokenCheck_Card({ organization, userId }: { organization: OrganizationData, userId: UserId }) {
    const { data: accessTokens } = useSuspenseQuery(D4hAccessTokens.queryOptions({ userId, orgId: organization.orgId }))

    const hasAccessTokens = accessTokens.length > 0
    const uniqueTeams = extractUniqueTeams(accessTokens)

    return hasAccessTokens 
        ? <Alert title="D4H Access Tokens Configured" severity="success">
            You have configured {accessTokens.length} D4H access tokens providing access to {uniqueTeams.length} unique teams.
        </Alert>
        : <Alert title="No D4H Access Tokens Configured" severity="warning">
            <p>
                You have not configured any D4H access tokens. Please visit the D4H Access Tokens page to set up your tokens.
            </p>
            <p>
                <TextLink to={Paths.org(organization.slug).personal.d4hAccessTokens}>Go to D4H Access Tokens</TextLink>
            </p>
        </Alert>

}
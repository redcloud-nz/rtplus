/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/personal/d4h-access-tokens/[token_id]
 */

import { auth } from '@clerk/nextjs/server'

import { getOrganization } from '@/server/organization'


import { Personal_D4hAccessTokens_Token_Details } from './token-details'
import { UserId } from '@/lib/schemas/user'



export default async function Personal_D4hAccessTokens_Token_Page(props: PageProps<'/orgs/[org_slug]/personal/d4h-access-tokens/[token_id]'>) {
    const { org_slug: orgSlug, token_id: tokenId } = await props.params
    const organization = await getOrganization(orgSlug)

    const { userId } = await auth.protect()

    return <Personal_D4hAccessTokens_Token_Details organization={organization} userId={UserId.parse(userId)} tokenId={tokenId}/>

}
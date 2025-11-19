/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/personal/d4h-access-tokens
 */


import { auth } from '@clerk/nextjs/server'
import { Lexington } from '@/components/blocks/lexington'

import { UserId } from '@/lib/schemas/user'
import { getOrganization } from '@/server/organization'

import { Personal_D4hAccessTokens_List } from './access-token-list'


export default async function Personal_D4hAccessTokens_Page(props: PageProps<'/orgs/[org_slug]/personal/d4h-access-tokens'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    const { userId } = await auth.protect()

    return <Lexington.Column width="xl">
        <Personal_D4hAccessTokens_List organization={organization} userId={userId as UserId}/>
    </Lexington.Column>
}

 



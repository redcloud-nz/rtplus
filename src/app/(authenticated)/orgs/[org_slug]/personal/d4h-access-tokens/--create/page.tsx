/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /orgs/[org_slug]/personal/d4h-access-tokens/--create
 */

import { auth } from '@clerk/nextjs/server'

import { Lexington } from '@/components/blocks/lexington'
import { ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link } from '@/components/ui/link'

import { UserId } from '@/lib/schemas/user'
import * as Paths from '@/paths'
import { getOrganization } from '@/server/organization'

import { Personal_CreateD4hAccessToken_Form } from './create-d4h-access-token'




export default async function Personal_CreateD4hAccessToken_Page(props: PageProps<'/orgs/[org_slug]/personal/d4h-access-tokens/--create'>) {
    const { org_slug: orgSlug } = await props.params
    const organization = await getOrganization(orgSlug)

    const { userId } = await auth.protect()

    return <Lexington.Column width="lg">
        <Lexington.ColumnControls>
            <S2_Button variant="outline" asChild>
            <Link to={Paths.org(orgSlug).personal.d4hAccessTokens }>
                <ToParentPageIcon/> Access Token List
            </Link>
        </S2_Button>
        </Lexington.ColumnControls>
        <Personal_CreateD4hAccessToken_Form organization={organization} userId={UserId.schema.parse(userId)} />
    </Lexington.Column>
}
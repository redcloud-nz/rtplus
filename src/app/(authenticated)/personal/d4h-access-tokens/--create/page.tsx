/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /personal/d4h-access-tokens/--create
 */

import { auth } from '@clerk/nextjs/server'

import { Lexington } from '@/components/blocks/lexington'
import { ToParentPageIcon } from '@/components/icons'
import { S2_Button } from '@/components/ui/s2-button'
import { Link } from '@/components/ui/link'

import * as Paths from '@/paths'

import { Personal_CreateD4hAccessToken_Form } from './create-d4h-access-token'
import { UserId } from '@/lib/schemas/user'


export default async function Personal_CreateD4hAccessToken_Page() {

    const { userId } = await auth.protect()

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[
                Paths.personal,
                Paths.personal.d4hAccessTokens,
                Paths.personal.d4hAccessTokens.create,
            ]}
        />
        <Lexington.Page>
            <Lexington.Column width="lg">
                <Lexington.ColumnControls>
                    <S2_Button variant="outline" asChild>
                    <Link to={Paths.personal.d4hAccessTokens }>
                        <ToParentPageIcon/> Access Token List
                    </Link>
                </S2_Button>
                </Lexington.ColumnControls>
                <Personal_CreateD4hAccessToken_Form userId={UserId.schema.parse(userId)} />
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}
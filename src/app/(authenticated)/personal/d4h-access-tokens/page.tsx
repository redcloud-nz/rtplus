/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /personal/d4h-access-tokens
 */

import { Metadata } from 'next'

import { auth } from '@clerk/nextjs/server'
import { Lexington } from '@/components/blocks/lexington'

import { UserId } from '@/lib/schemas/user'
import * as Paths from '@/paths'

import { Personal_D4hAccessTokens_List } from './access-token-list'







export const metadata: Metadata = { title: "D4H Access Tokens - Personal" }

export default async function Personal_D4hAccessTokens_Page() {

    const { userId } = await auth.protect()

    return <Lexington.Root>
        <Lexington.Header breadcrumbs={[
            Paths.personal,
            Paths.personal.d4hAccessTokens
        ]}/>
        <Lexington.Page>
            <Lexington.Column width="xl">
                <Personal_D4hAccessTokens_List userId={userId as UserId}/>
            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}

 



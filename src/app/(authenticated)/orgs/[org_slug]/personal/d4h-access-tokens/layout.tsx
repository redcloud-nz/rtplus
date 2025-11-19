/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 *  Path: /orgs/[org_slug]/personal/d4h-access-tokens
 */


import { Metadata } from 'next'

import { Lexington } from '@/components/blocks/lexington'
import { TITLE_SEPARATOR } from '@/lib/utils'
import * as Paths from '@/paths'


export const metadata: Metadata = { title: `D4H Access Tokens ${TITLE_SEPARATOR} Personal` }


export default async function Personal_D4hAccessTokens_Layout(props: LayoutProps<'/orgs/[org_slug]/personal/d4h-access-tokens'>) {
    const { org_slug: orgSlug } = await props.params

    return <Lexington.Root>
            <Lexington.Header breadcrumbs={[
                Paths.org(orgSlug).personal,
                Paths.org(orgSlug).personal.d4hAccessTokens
            ]}/>
            <Lexington.Page>
                {props.children}
            </Lexington.Page>
        </Lexington.Root>
}
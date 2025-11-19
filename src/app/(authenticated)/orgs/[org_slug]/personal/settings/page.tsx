/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]/personal/settings
 */
import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'


export default async function PersonalSettings_Page(props: PageProps<'/orgs/[org_slug]/personal/settings'>) {
    const { org_slug: orgSlug } = await props.params

    return <Lexington.Root >
        <Lexington.Header breadcrumbs={[
            Paths.org(orgSlug).personal,
            Paths.org(orgSlug).personal.settings
        ]}/>
        <Lexington.Page>
            <Lexington.Column>

            </Lexington.Column>
        </Lexington.Page>
    </Lexington.Root>
}
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { CreateOrganization } from '@clerk/nextjs'

import { Lexington } from '@/components/blocks/lexington'

import * as Paths from '@/paths'

export const metadata = { title: 'Create Organization' }

export default async function CreateOrganization_Page(props: PageProps<'/orgs/--create'>) {

    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={[Paths.orgs.create]}
        />
        <Lexington.Page variant="container">
            <CreateOrganization
                afterCreateOrganizationUrl="/orgs/:slug"
                path="/orgs/--create"
            />
        </Lexington.Page>
    </Lexington.Root>
}
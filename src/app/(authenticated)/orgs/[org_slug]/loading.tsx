/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /orgs/[org_slug]
 */

import { Lexington } from '@/components/blocks/lexington'
import { PageLoadingSpinner } from '@/components/ui/loading'

export default function Organization_Loading() {

    return <Lexington.Root>
        <Lexington.Header/>
        <PageLoadingSpinner message="Loading..."/>
    </Lexington.Root>
}
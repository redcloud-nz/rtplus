/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /
 */
'use client'

import { Lexington } from '@/components/blocks/lexington'
import { UnknownError } from '@/components/nav/errors'


export default function Authenticated_ErrorPage({ error }: { error: Error & { digest?: string } }) {
    return <Lexington.Root>
        <Lexington.Header
            breadcrumbs={["Error"]}
        />
        <Lexington.Page>
            <UnknownError error={error}/>
        </Lexington.Page>
        
    </Lexington.Root>
}
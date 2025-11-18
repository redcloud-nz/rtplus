/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /
 */
'use client'

import { AppPage } from '@/components/app-page'
import { UnknownError } from '@/components/nav/errors'


export default function Organization_ErrorPage({ error }: { error: Error & { digest?: string } }) {
    return <AppPage>
        <UnknownError error={error}/>
    </AppPage>
}
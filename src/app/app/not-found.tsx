/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app
 */

import { AppPage } from '@/components/app-page'
import { NotFound } from '@/components/nav/errors'

export default function AppNotFoundPage() {
    return <AppPage>
        <NotFound/>
    </AppPage>
}
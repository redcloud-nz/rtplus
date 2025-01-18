/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /
 */

import { AppPageContainer } from '@/components/app-page'
import { NotFound } from '@/components/errors'

export default function NotFoundPage() {
    return <AppPageContainer>
        <NotFound/>
    </AppPageContainer>
}
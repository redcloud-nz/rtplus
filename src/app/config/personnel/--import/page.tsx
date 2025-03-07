/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { AppPage } from "@/components/app-page"
import { useAccessTokensQuery } from "@/lib/d4h-access-tokens"

export default function ImportPersonnel() {

    const accessTokenQuery = useAccessTokensQuery()

    return <AppPage
        label="Import Skill Pacakage"
                
    ></AppPage>
}
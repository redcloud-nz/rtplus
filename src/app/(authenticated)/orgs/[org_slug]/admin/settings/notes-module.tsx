/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */
'use client'

import { useForm } from 'react-hook-form'

import { S2_Card, S2_CardContent, S2_CardHeader, S2_CardTitle } from '@/components/ui/s2-card'

import { OrganizationSettingsData } from '@/lib/schemas/settings'

/**
 * Card containing the organization level settings for the Notes module.
 */
export function Settings_NotesModule_Card({}: { form: ReturnType<typeof useForm<OrganizationSettingsData>> }) {

    return <S2_Card>
        <S2_CardHeader>
            <S2_CardTitle>Notes Module</S2_CardTitle>

        </S2_CardHeader>
        <S2_CardContent>
            <p className="text-sm text-muted-foreground">No settings available yet for the notes module.</p>
        </S2_CardContent>
    </S2_Card>
}
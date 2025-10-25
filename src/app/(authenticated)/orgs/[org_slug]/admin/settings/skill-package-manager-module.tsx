/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *
 */
'use client'

import { useForm } from 'react-hook-form'

import { Card2, Card2Content } from '@/components/ui/card2'

import { OrganizationSettingsData } from '@/lib/schemas/settings'

/**
 * Card containing the organization level settings for the Skill Package Manager module.
 */
export function Settings_SkillPackageManagerModule_Card({}: { form: ReturnType<typeof useForm<OrganizationSettingsData>> }) {

    return <Card2>
        <Card2Content>
            <p className="text-sm text-muted-foreground">Settings for the Skill Package Manager module will go here.</p>
        </Card2Content>
    </Card2>
}
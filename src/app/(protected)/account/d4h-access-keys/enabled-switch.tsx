/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import React from 'react'

import { Switch } from '@/components/ui/switch'

import { updateAccessKey } from './actions'

export interface EnabledSwitchProps {
    accessKeyId: string
    defaultChecked: boolean
}

export function EnabledSwitch({ accessKeyId, defaultChecked }: EnabledSwitchProps) {

    const [checked, setChecked] = React.useState<boolean>(defaultChecked)
    const [pending, setPending] = React.useState<boolean>(false)

    async function handleCheckedChange(newValue: boolean) {
        setChecked(newValue)
        setPending(true)

        await updateAccessKey({ accessKeyId, enabled: newValue })

        setPending(false)
    }

    return <Switch checked={checked} onCheckedChange={handleCheckedChange} disabled={pending}/>
}
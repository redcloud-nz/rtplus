/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { flag } from 'flags/next'
import { edgeConfigAdapter } from '@flags-sdk/edge-config'

export const objectTagsFeatureFlag = flag({
    key: 'object-tags-enabled',
    defaultValue: false,
    adapter: edgeConfigAdapter()
})


// Module availability flags

export const availabilityModuleFlag = flag({
    key: 'availability-module',
    defaultValue: false,
    adapter: edgeConfigAdapter()
})

export const checklistsModuleFlag = flag({
    key: 'checklists-module',
    defaultValue: false,
    adapter: edgeConfigAdapter()
})

export const d4hViewsModuleFlag = flag({
    key: 'd4h-views-module',
    defaultValue: false,
    adapter: edgeConfigAdapter()
})

export const fogModuleFlag = flag({
    key: 'fog-module',
    defaultValue: false,
    adapter: edgeConfigAdapter()
})

export const notesModuleFlag = flag({
    key: 'notes-module',
    defaultValue: false,
    adapter: edgeConfigAdapter()
})
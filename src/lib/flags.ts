/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { flag } from 'flags/next'
import { edgeConfigAdapter } from '@flags-sdk/edge-config'

export const teamMemberTagsEnabledFlag = flag({
    key: 'team-member-tags-enabled',
    defaultValue: false,
    adapter: edgeConfigAdapter()
})

export const notesEnabledFlag = flag({
    key: 'notes-enabled',
    defaultValue: false,
    adapter: edgeConfigAdapter()
})
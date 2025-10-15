/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { entries, mapToObj } from 'remeda'


export type ModuleID = 'd4h' | 'notes' | 'skills'

export interface Module {
    moduleId: ModuleID
    label: string
}


export const Modules: Module[] = [
    { moduleId: 'd4h', label: 'D4H Integration' },
    { moduleId: 'notes', label: 'Notes' },
    { moduleId: 'skills', label: 'Skill Tracking' },
] as const


export function extractEnabledModules(modules: Record<ModuleID, { enabled: boolean }>): Record<ModuleID, boolean> {
    return mapToObj(entries(modules), ([key, value]) => [key, value.enabled])
}
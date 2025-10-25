/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { entries, mapToObj } from 'remeda'
import { OrganizationData } from './schemas/organization'


export type ModuleID = 'd4h-views' | 'notes' | 'skills' | 'skill-package-manager'

export interface Module {
    moduleId: ModuleID
    label: string
    settingsKey: keyof OrganizationData['settings']['modules']
}


export const Modules: Module[] = [
    { moduleId: 'd4h-views', label: 'D4H Integration', settingsKey: 'd4hViews' },
    { moduleId: 'notes', label: 'Notes', settingsKey: 'notes' },
    { moduleId: 'skills', label: 'Skill Tracking', settingsKey: 'skills' },
    { moduleId: 'skill-package-manager', label: 'Skill Package Manager', settingsKey: 'skillPackageManager' },
] as const


export function extractEnabledModules(modules: Record<ModuleID, { enabled: boolean }>): Record<ModuleID, boolean> {
    return mapToObj(entries(modules), ([key, value]) => [key, value.enabled])
}

/**
 * Check if a module is enabled for the given organization.
 * @param organization The organization data
 * @param moduleId The ID of the module to check
 * @returns True if the module is enabled, false otherwise
 */
export function isModuleEnabled(organization: OrganizationData, moduleId: ModuleID): boolean {
    const module = Modules.find(m => m.moduleId === moduleId)
    if (!module) throw new Error(`Unknown module ID: ${moduleId}`)

    const modulesSettings = organization.settings.modules || {}
    return modulesSettings[module.settingsKey]?.enabled === true
}
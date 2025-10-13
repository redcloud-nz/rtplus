/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

type ModuleID = 'd4h' | 'notes' | 'skills' | 'skill-package-builder'

export interface Module {
    moduleId: ModuleID
    label: string
}


export const Modules: Module[] = [
    { moduleId: 'd4h', label: 'D4H Integration' },
    { moduleId: 'notes', label: 'Notes' },
    { moduleId: 'skills', label: 'Skill Tracking' },
    { moduleId: 'skill-package-builder', label: 'Skill Package Builder' },
] as const 

export const enabledModulesSchema = z.array(z.enum(['d4h', 'notes', 'skills', 'skill-package-builder'])).default([])

export type EnabledModulesData = z.infer<typeof enabledModulesSchema>